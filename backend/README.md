# Epix Backend

FastAPI backend for image-to-video generation using Wan 2.2.

## Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

## Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/generate/image-to-video` - Generate video from image + prompt
- `GET /api/generate/generations` - List user's generations
- `GET /api/health` - Health check

## Model

Currently using a placeholder video generator. Replace `app/services/video_generator.py` with actual Wan 2.2 inference.

## DB

SQLite by default. Set `DATABASE_URL` env var to use PostgreSQL.

For the GPU/local generation stack, install equirements-gpu.txt instead. Env vars: DATABASE_URL, SECRET_KEY, CORS_ORIGINS (comma-separated).
