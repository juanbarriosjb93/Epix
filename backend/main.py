import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import auth, generate

app = FastAPI(title="Epix Backend", version="0.1.0")

ALLOWED_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]

os.makedirs("storage/img2img", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(generate.router)

app.mount("/storage", StaticFiles(directory="storage"), name="storage")
app.mount("/storage/img2img", StaticFiles(directory="storage/img2img"), name="img2img")

@app.get("/api/health")
def health():
    return {"status": "ok"}
