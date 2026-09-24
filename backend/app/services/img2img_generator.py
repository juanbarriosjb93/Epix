import os
import base64
import io
import logging
import torch
from PIL import Image
from datetime import datetime
from app.db import SessionLocal
from app.models.models import Generation
from app.services.comfy_client import free_models

logger = logging.getLogger(__name__)

IMG2IMG_STORAGE_DIR = os.getenv("IMG2IMG_STORAGE_DIR", "storage/img2img")
os.makedirs(IMG2IMG_STORAGE_DIR, exist_ok=True)

USE_FLUX2 = os.getenv("USE_FLUX2", "true").lower() == "true"

_pipe = None
_model_type = None


def _resolve_model_path() -> str:
    env_path = os.getenv("IMG2IMG_MODEL_PATH")
    if env_path and os.path.isdir(env_path):
        return env_path

    local_dir = "FLUX.2-dev-bnb-4bit" if USE_FLUX2 else "FLUX.1-schnell"
    local_path = os.path.join(os.path.dirname(__file__), "..", "..", "models", local_dir)
    if os.path.isdir(local_path):
        return local_path

    if USE_FLUX2:
        return "diffusers/FLUX.2-dev-bnb-4bit"
    return "black-forest-labs/FLUX.1-schnell"


def _get_pipe():
    global _pipe, _model_type
    if _pipe is not None:
        return _pipe

    device = "cuda" if torch.cuda.is_available() else "cpu"
    torch_dtype = torch.bfloat16 if device == "cuda" else torch.float32
    model_path = _resolve_model_path()

    logger.info(f"Loading img2img model: {model_path} (flux2={USE_FLUX2})")

    if USE_FLUX2:
        from diffusers import Flux2Pipeline
        _pipe = Flux2Pipeline.from_pretrained(
            model_path,
            torch_dtype=torch_dtype,
        )
        _model_type = "flux2"
    else:
        from diffusers import FluxImg2ImgPipeline
        _pipe = FluxImg2ImgPipeline.from_pretrained(
            model_path,
            torch_dtype=torch_dtype,
        )
        _model_type = "flux1"

    if device == "cuda":
        _pipe.enable_model_cpu_offload()
        if hasattr(_pipe, "enable_attention_slicing"):
            _pipe.enable_attention_slicing()
        if hasattr(_pipe, "enable_vae_slicing"):
            _pipe.enable_vae_slicing()
        if hasattr(_pipe, "enable_vae_tiling"):
            _pipe.enable_vae_tiling()
        torch.cuda.empty_cache()

    logger.info(f"Model loaded: {_model_type} on {device}")
    return _pipe


def _decode_image(image_url: str | None) -> Image.Image | None:
    if not image_url or not image_url.startswith("data:"):
        return None
    try:
        header, data = image_url.split(",", 1)
        image_data = base64.b64decode(data)
        img = Image.open(io.BytesIO(image_data)).convert("RGB")
        w, h = img.size
        if w <= 0 or h <= 0:
            logger.warning("Invalid image dimensions: %dx%d", w, h)
            return None
        max_side = 512
        if max(w, h) > max_side:
            scale = max_side / max(w, h)
            new_size = (int(w * scale), int(h * scale))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        return img
    except Exception as e:
        logger.warning("Failed to decode image: %s", e)
        return None


def _check_vram(required_gb: float = 6.0) -> bool:
    if not torch.cuda.is_available():
        return False
    props = torch.cuda.get_device_properties(0)
    total_mem = props.total_memory / (1024 ** 3)
    reserved = torch.cuda.memory_reserved(0) / (1024 ** 3)
    free = total_mem - reserved
    return free >= required_gb


def _run_inference(pipe, prompt: str, img: Image.Image, strength: float):
    if _model_type == "flux2":
        return pipe(
            prompt=prompt,
            image=img,
            num_inference_steps=20,
            guidance_scale=4.0,
        )
    else:
        return pipe(
            prompt=prompt,
            image=img,
            strength=strength,
            num_inference_steps=4,
            guidance_scale=2.5,
        )


def generate_img2img(gen_id: str, prompt: str, image_urls: list[str] | None, strength: float = 0.6, db=None):
    gen = db.query(Generation).filter(Generation.id == gen_id).first()
    if not gen:
        return

    try:
        gen.status = "processing"
        gen.error = None
        db.commit()

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        free_models()
        pipe = _get_pipe()
        images = []
        for idx, url in enumerate(image_urls or []):
            img = _decode_image(url)
            if img is None:
                logger.warning("Skipping invalid image %d for generation %s", idx, gen_id)
                continue

            try:
                result = _run_inference(pipe, prompt, img, strength)
            except torch.cuda.OutOfMemoryError:
                logger.warning("CUDA OOM, clearing cache and retrying...")
                torch.cuda.empty_cache()
                result = _run_inference(pipe, prompt, img, strength)

            out_path = os.path.join(IMG2IMG_STORAGE_DIR, f"{gen_id}_{idx}.png")
            result.images[0].save(out_path)
            images.append(f"/storage/img2img/{gen_id}_{idx}.png")
            logger.info("Saved output: %s", out_path)

        gen.image_url = "|".join(images) if images else None
        gen.video_url = None
        gen.status = "completed" if images else "failed"
        if not images:
            gen.error = "No valid input images"
        gen.completed_at = datetime.utcnow()
        db.commit()

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    except Exception as e:
        logger.error("img2img generation failed: %s", e)
        gen.status = "failed"
        gen.error = str(e)
        gen.completed_at = datetime.utcnow()
        db.commit()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
