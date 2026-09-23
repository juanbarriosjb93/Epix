from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import auth, generate

app = FastAPI(title="Epix Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
