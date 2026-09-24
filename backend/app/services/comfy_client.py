import os
import time
import logging
import requests

logger = logging.getLogger(__name__)

COMFYUI_URL = os.getenv("COMFYUI_URL", "http://127.0.0.1:8188")
POLL_INTERVAL = float(os.getenv("COMFYUI_POLL_INTERVAL", "5"))
GENERATION_TIMEOUT = float(os.getenv("COMFYUI_GENERATION_TIMEOUT", "900"))

H3_UNET = os.getenv("H3_UNET", "minimax_h3_fl2va_pruned_int8_convrot.safetensors")
H3_CLIP = os.getenv("H3_CLIP", "qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors")
H3_VAE = os.getenv("H3_VAE", "minimax_h3_video_vae_fp16.safetensors")
H3_AUDIO_VAE = os.getenv("H3_AUDIO_VAE", "minimax_h3_audio_vae_fp32.safetensors")
H3_TURBO_LORA = os.getenv("H3_TURBO_LORA", "minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors")

H3_TURBO = os.getenv("H3_TURBO", "true").lower() == "true"
H3_TURBO_STEPS = int(os.getenv("H3_TURBO_STEPS", "8"))
H3_STEPS = int(os.getenv("H3_STEPS", "20"))
H3_WIDTH = int(os.getenv("H3_WIDTH", "768"))
H3_HEIGHT = int(os.getenv("H3_HEIGHT", "1344"))
H3_DURATION_SEC = float(os.getenv("H3_DURATION_SEC", "5"))


def is_available() -> bool:
    """Check an inexpensive endpoint that remains usable while Comfy is busy.

    ``/system_stats`` can return 500 on otherwise healthy ComfyUI installs, so
    it is not a reliable readiness probe for a generation service.
    """
    try:
        resp = requests.get(f"{COMFYUI_URL}/object_info", timeout=15)
        return resp.status_code == 200
    except Exception:
        return False


def free_models() -> None:
    """Release ComfyUI's cached models so other GPU tenants can run."""
    try:
        requests.post(
            f"{COMFYUI_URL}/free",
            json={"unload_models": True, "free_memory": True},
            timeout=30,
        )
    except Exception:
        logger.warning("Failed to free ComfyUI models", exc_info=True)


def upload_image(image_bytes: bytes, filename: str) -> str:
    resp = requests.post(
        f"{COMFYUI_URL}/upload/image",
        files={"image": (filename, image_bytes, "image/png")},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["name"]


def align_frame_count(duration_sec: float) -> int:
    frames = max(5, round(duration_sec * 24))
    return frames + (5 - (frames % 17)) % 17


def build_i2v_workflow(
    prompt: str,
    image_name: str,
    width: int | None = None,
    height: int | None = None,
    duration_sec: float | None = None,
    seed: int | None = None,
    turbo: bool | None = None,
) -> dict:
    w = width or H3_WIDTH
    h = height or H3_HEIGHT
    dur = duration_sec or H3_DURATION_SEC
    length = align_frame_count(dur)
    seed = seed if seed is not None else int(time.time() * 1000) % (2 ** 32)
    use_turbo = H3_TURBO if turbo is None else turbo
    steps = H3_TURBO_STEPS if use_turbo else H3_STEPS
    lora_strength = 1.0 if use_turbo else 0.0

    workflow = {
        "1": {"class_type": "UNETLoader", "inputs": {"unet_name": H3_UNET, "weight_dtype": "default"}},
        "2": {
            "class_type": "LoraLoaderModelOnly",
            "inputs": {
                "model": ["1", 0],
                "lora_name": H3_TURBO_LORA,
                "strength_model": lora_strength,
            },
        },
        "3": {
            "class_type": "CLIPLoader",
            "inputs": {"clip_name": H3_CLIP, "type": "minimax", "device": "default"},
        },
        "4": {"class_type": "VAELoader", "inputs": {"vae_name": H3_VAE}},
        "5": {"class_type": "VAELoader", "inputs": {"vae_name": H3_AUDIO_VAE}},
        "6": {"class_type": "LoadImage", "inputs": {"image": image_name}},
        "7": {
            "class_type": "MiniMaxH3ImageToVideo",
            "inputs": {
                "clip": ["3", 0],
                "vae": ["4", 0],
                "first_frame": ["6", 0],
                "prompt": prompt,
                "width": w,
                "height": h,
                "length": length,
            },
        },
        "8": {"class_type": "RandomNoise", "inputs": {"noise_seed": seed, "control_after_generate": "fixed"}},
        "9": {"class_type": "KSamplerSelect", "inputs": {"sampler_name": "res_multistep"}},
        "10": {
            "class_type": "BasicScheduler",
            "inputs": {"model": ["2", 0], "scheduler": "simple", "steps": steps, "denoise": 1.0},
        },
        "11": {
            "class_type": "BasicGuider",
            "inputs": {"model": ["2", 0], "conditioning": ["7", 0]},
        },
        "12": {
            "class_type": "SamplerCustomAdvanced",
            "inputs": {
                "noise": ["8", 0],
                "guider": ["11", 0],
                "sampler": ["9", 0],
                "sigmas": ["10", 0],
                "latent_image": ["7", 1],
            },
        },
        "13": {"class_type": "VAEDecode", "inputs": {"samples": ["12", 0], "vae": ["4", 0]}},
        "14": {"class_type": "VAEDecodeAudio", "inputs": {"samples": ["12", 0], "vae": ["5", 0]}},
        "15": {
            "class_type": "CreateVideo",
            "inputs": {"images": ["13", 0], "audio": ["14", 0], "fps": 24, "bit_depth": 8},
        },
        "16": {
            "class_type": "SaveVideo",
            "inputs": {"video": ["15", 0], "filename_prefix": "epix", "format": "mp4", "codec": "auto"},
        },
    }
    return workflow


def submit_prompt(workflow: dict) -> str:
    resp = requests.post(f"{COMFYUI_URL}/prompt", json={"prompt": workflow}, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if "prompt_id" not in data:
        raise RuntimeError(f"ComfyUI rejected prompt: {data}")
    return data["prompt_id"]


def wait_for_completion(prompt_id: str, timeout: float | None = None) -> dict:
    timeout = timeout or GENERATION_TIMEOUT
    start = time.time()
    while time.time() - start < timeout:
        try:
            # During a long GPU operation Comfy can briefly stop servicing HTTP.
            # That is not a failed generation; retry until the overall deadline.
            resp = requests.get(f"{COMFYUI_URL}/history/{prompt_id}", timeout=(5, 120))
        except requests.Timeout:
            logger.debug("ComfyUI is busy; continuing to wait for %s", prompt_id)
            continue
        resp.raise_for_status()
        data = resp.json()
        entry = data.get(prompt_id)
        if not entry:
            time.sleep(POLL_INTERVAL)
            continue
        status = entry.get("status") or {}
        if status.get("completed") is True:
            return {"status": status, "outputs": _get_outputs(entry)}
        if status.get("status_str") in ("error", "cancelled"):
            raise RuntimeError(f"ComfyUI generation failed: {status}")
        time.sleep(POLL_INTERVAL)
    raise TimeoutError(f"ComfyUI generation timed out after {timeout}s")


def _get_outputs(history_entry: dict) -> list[dict]:
    outputs = []
    node_outputs = history_entry.get("outputs") or {}
    for node_id, node_output in node_outputs.items():
        if not isinstance(node_output, dict):
            continue
        for type_key, value in node_output.items():
            if isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        outputs.append({**item, "__node_type__": type_key})
            elif isinstance(value, dict):
                outputs.append({**value, "__node_type__": type_key})
    return outputs


def fetch_output_file(filename: str, subfolder: str = "", file_type: str = "output") -> bytes:
    import urllib.parse

    params = {"filename": filename, "type": file_type}
    if subfolder:
        params["subfolder"] = subfolder
    url = f"{COMFYUI_URL}/view?{urllib.parse.urlencode(params)}"
    resp = requests.get(url, timeout=300)
    resp.raise_for_status()
    return resp.content


def find_video_output(outputs: list[dict]) -> dict | None:
    for out in outputs:
        if "filename" in out:
            return out
    return None
