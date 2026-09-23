import sys, os
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("USE_FLUX2", "false")

from huggingface_hub import snapshot_download

print("Starting FLUX.2-dev-bnb-4bit download (~34 GB)...")
print("This may take 10-30 minutes depending on your connection.")

snapshot_download(
    "diffusers/FLUX.2-dev-bnb-4bit",
    local_dir="C:/Users/ADMIN/Desktop/epix/backend/models/FLUX.2-dev-bnb-4bit",
)

print("\n=== DOWNLOAD COMPLETE ===")
print("To enable FLUX.2, edit backend/.env:")
print("  IMG2IMG_MODEL_PATH=C:/Users/ADMIN/Desktop/epix/backend/models/FLUX.2-dev-bnb-4bit")
print("  USE_FLUX2=true")
