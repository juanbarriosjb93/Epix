from PIL import Image, ImageDraw, ImageFont
import numpy as np
import cv2
import os
import sys
import torch
import imageio

OUTPUT_PATH = r"C:\Users\ADMIN\Desktop\epix\public\epix-intro.mp4"
STORAGE = r"C:\Users\ADMIN\Desktop\epix\backend\storage"
FRAMES = 48
FPS = 24
WIDTH = 1080
HEIGHT = 1920

GLOW_COLOR = (167, 139, 250)  # violet-400
BG_COLOR = (5, 5, 8)  # #050508

def make_intro_frame(frame_idx: int, total_frames: int) -> Image.Image:
    progress = frame_idx / max(total_frames - 1, 1)

    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img, "RGBA")

    glow_x = int(WIDTH * (0.15 + 0.7 * progress))
    glow_y = int(HEIGHT * 0.45)
    glow_radius = int(180 + 60 * np.sin(progress * np.pi * 2))

    for r, alpha in [(glow_radius, 40), (int(glow_radius * 0.7), 70), (int(glow_radius * 0.4), 110)]:
        draw.ellipse(
            [glow_x - r, glow_y - r, glow_x + r, glow_y + r],
            fill=(*GLOW_COLOR, alpha),
        )

    font_size = int(140 + 15 * np.sin(progress * np.pi * 3))
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
        font_small = ImageFont.truetype("arial.ttf", int(font_size * 0.55))
    except Exception:
        font = ImageFont.load_default()
        font_small = ImageFont.load_default()

    text = "epi"
    text_x = WIDTH // 2 - int(font_size * 1.1)
    text_y = HEIGHT // 2 - font_size // 2

    for dx, dy, alpha in [(6, 6, 60), (-6, -6, 60), (0, 0, 220)]:
        draw.text((text_x + dx, text_y + dy), text, font=font, fill=(*GLOW_COLOR, alpha))

    draw.text((text_x, text_y), text, font=font, fill=(200, 200, 220, 255))

    x_text = "X"
    x_size = int(font_size * 1.25)
    try:
        x_font = ImageFont.truetype("arial.ttf", x_size)
    except Exception:
        x_font = ImageFont.load_default()
    x_x = text_x + int(font_size * 1.05)
    x_y = text_y - int(font_size * 0.12)

    glow_phase = np.sin(progress * np.pi * 4) * 0.5 + 0.5
    accent = (int(236 * (0.6 + 0.4 * glow_phase)), int(72 * (0.6 + 0.4 * glow_phase)), int(153 * (0.6 + 0.4 * glow_phase)))

    for dx, dy, alpha in [(10, 10, 80), (-10, -10, 80), (0, 0, 255)]:
        draw.text((x_x + dx, x_y + dy), x_text, font=x_font, fill=(*accent, alpha))

    draw.text((x_x, x_y), x_text, font=x_font, fill=(255, 255, 255, 255))

    tagline = "AI Vertical Video"
    tag_y = text_y + int(font_size * 1.25)
    tag_alpha = int(180 * min(1.0, max(0.0, (progress - 0.4) / 0.25)))
    draw.text((WIDTH // 2 - 180, tag_y), tagline, font=font_small, fill=(180, 170, 220, tag_alpha))

    return img

def main():
    print("Generating intro frames...")
    os.makedirs(STORAGE, exist_ok=True)

    pil_frames = [make_intro_frame(i, FRAMES) for i in range(FRAMES)]

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Device: {device}")

    from diffusers import WanImageToVideoPipeline
    from diffusers.utils import export_to_video

    model_path = r"C:\Users\ADMIN\Desktop\epix\backend\models\Wan2.2-TI2V-5B-Diffusers"

    first = pil_frames[0]
    first.save(os.path.join(STORAGE, "epix-intro-source.png"))

    print("Loading Wan 2.2 pipeline...")
    pipe = WanImageToVideoPipeline.from_pretrained(model_path, torch_dtype=torch.float16 if device == "cuda" else torch.float32)
    if device == "cuda":
        pipe.enable_model_cpu_offload()
    pipe = pipe.to(device)

    print("Generating intro video with Wan 2.2...")
    result = pipe(
        image=first,
        prompt="An elegant dark intro animation with glowing violet fuchsia text 'epiX', emphasis on the X letter, smooth zoom and glow effects, dark background #050508, premium brand reveal, vertical 9:16, high contrast, luxury brand aesthetic",
        num_frames=FRAMES,
        guidance_scale=7.5,
    )
    frames = result.frames[0]
    print(f"Wan 2.2 generated {len(frames)} frames")

    print("Exporting to video with imageio...")
    writer = imageio.get_writer(OUTPUT_PATH, fps=FPS, quality=9, macro_block_size=8, codec="libx264", pixelformat="yuv420p")
    for frame in frames:
        writer.append_data(np.array(frame))
    writer.close()

    print(f"Intro video saved: {OUTPUT_PATH}")

    file_size = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f"File size: {file_size:.2f} MB")

if __name__ == "__main__":
    main()
