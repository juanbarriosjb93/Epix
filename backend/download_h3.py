import os
import sys
import logging

sys.path.insert(0, os.path.dirname(__file__))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), "download_h3.log"), encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger("h3")

from huggingface_hub import hf_hub_download

REPO = "Comfy-Org/MiniMax-H3"
MODELS_DIR = "C:/Users/ADMIN/ComfyUI/models"

FILES = [
    "diffusion_models/minimax_h3_fl2va_pruned_int8_convrot.safetensors",
    "text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors",
    "vae/minimax_h3_video_vae_fp16.safetensors",
    "vae/minimax_h3_audio_vae_fp32.safetensors",
    "loras/minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors",
]


def download_file(filename: str):
    local_path = os.path.join(MODELS_DIR, filename)
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    final_marker = local_path + ".complete"
    if os.path.exists(final_marker):
        logger.info("SKIP (already done): %s", filename)
        return True
    if os.path.exists(local_path):
        done = os.path.getsize(local_path)
        logger.info("RESUME %s: %s bytes already present", filename, done)
    logger.info("DOWNLOADING: %s", filename)
    hf_hub_download(
        repo_id=REPO,
        filename=filename,
        local_dir=MODELS_DIR,
        local_dir_use_symlinks=False,
    )
    with open(final_marker, "w") as f:
        f.write("ok")
    logger.info("DONE: %s", filename)
    return True


def main():
    logger.info("=== MiniMax H3 download start ===")
    for f in FILES:
        try:
            download_file(f)
        except Exception as e:
            logger.error("FAILED %s: %s", f, e)
            raise
    logger.info("=== ALL DOWNLOADS COMPLETE ===")


if __name__ == "__main__":
    main()