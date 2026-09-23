import os
import base64
import io
import logging
from datetime import datetime
from PIL import Image
from app.db import SessionLocal
from app.models.models import Generation
from app.services import comfy_client

logger = logging.getLogger(__name__)

STORAGE_DIR = os.getenv("STORAGE_DIR", "storage")
os.makedirs(STORAGE_DIR, exist_ok=True)


def _decode_image_bytes(image_url: str | None) -> bytes | None:
    if not image_url or not image_url.startswith("data:"):
        return None
    try:
        header, data = image_url.split(",", 1)
        return base64.b64decode(data)
    except Exception as e:
        logger.warning("Failed to decode image: %s", e)
        return None


def _make_placeholder_png() -> bytes:
    img = Image.new("RGB", (64, 64), (10, 10, 16))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def generate_video(gen_id: str, prompt: str, image_url: str | None, db):
    gen = db.query(Generation).filter(Generation.id == gen_id).first()
    if not gen:
        return

    output_path = os.path.join(STORAGE_DIR, f"{gen_id}.mp4")

    try:
        gen.status = "processing"
        gen.error = None
        db.commit()

        if not comfy_client.is_available():
            raise RuntimeError(
                f"ComfyUI not reachable at {comfy_client.COMFYUI_URL}. Start ComfyUI first."
            )

        image_bytes = _decode_image_bytes(image_url)
        if image_bytes is None:
            image_bytes = _make_placeholder_png()

        image_name = comfy_client.upload_image(image_bytes, f"{gen_id}.png")
        logger.info("Uploaded image to ComfyUI: %s", image_name)

        workflow = comfy_client.build_i2v_workflow(
            prompt=prompt,
            image_name=image_name,
        )
        prompt_id = comfy_client.submit_prompt(workflow)
        logger.info("Submitted H3 prompt %s for generation %s", prompt_id, gen_id)

        result = comfy_client.wait_for_completion(prompt_id)
        video_out = comfy_client.find_video_output(result.get("outputs", []))
        if video_out is None:
            raise RuntimeError("ComfyUI finished but no video output was found")

        filename = video_out.get("filename") or video_out.get("video", {}).get("filename")
        if not filename:
            raise RuntimeError(f"Could not locate output video filename: {video_out}")

        file_type = video_out.get("type", "output")
        subfolder = video_out.get("subfolder", "")
        data = comfy_client.fetch_output_file(filename, subfolder=subfolder, file_type=file_type)
        with open(output_path, "wb") as f:
            f.write(data)

        gen.video_url = f"/storage/{gen_id}.mp4"
        gen.status = "completed"
        gen.completed_at = datetime.utcnow()
        db.commit()
        logger.info("Saved H3 video for generation %s -> %s", gen_id, output_path)

    except Exception as e:
        logger.error("H3 video generation failed for %s: %s", gen_id, e)
        gen.status = "failed"
        gen.error = str(e)
        gen.completed_at = datetime.utcnow()
        db.commit()