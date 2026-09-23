from fastapi import APIRouter, Depends, HTTPException, status, Header, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os
import uuid
from datetime import datetime
from app.db import SessionLocal
from app.models.models import Generation, User
from app.security import decode_token

class GenerateRequest(BaseModel):
    prompt: str
    image_url: Optional[str] = None
    image_urls: Optional[list[str]] = None
    strength: Optional[float] = 0.6

class GenerateResponse(BaseModel):
    id: str
    prompt: str
    image_url: Optional[str]
    video_url: Optional[str]
    status: str
    model: str
    created_at: datetime
    completed_at: Optional[datetime]
    outputs: Optional[list[str]] = None
    error: Optional[str] = None

router = APIRouter(prefix="/generate", tags=["generate"])

def _get_outputs(generation: Generation) -> list[str] | None:
    if generation.status != "completed":
        return None
    if generation.model == "flux-img2img" and generation.image_url:
        return [
            f"/storage/img2img/{generation.id}_{idx}.png"
            for idx in range(len(generation.image_url.split("|")))
        ]
    if generation.video_url:
        return [generation.video_url]
    return None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: str = Header(...), db: Session = ...):
    from fastapi import Depends
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/image-to-video", response_model=GenerateResponse)
def image_to_video(req: GenerateRequest, background_tasks: BackgroundTasks, auth_header: str = Header(default=...), db: Session = Depends(get_db)):
    user = get_current_user(auth_header, db)
    gen = Generation(
        user_id=user.id,
        prompt=req.prompt,
        image_url=req.image_url,
        status="pending",
        model="minimax-h3",
    )
    db.add(gen)
    db.commit()
    db.refresh(gen)
    
    def run_video():
        from app.db import SessionLocal as SL
        db = SL()
        try:
            from app.services.video_generator import generate_video
            generate_video(gen.id, req.prompt, req.image_url, db)
        finally:
            db.close()

    background_tasks.add_task(run_video)
    
    return GenerateResponse(
        id=gen.id,
        prompt=gen.prompt,
        image_url=gen.image_url,
        video_url=gen.video_url,
        status=gen.status,
        model=gen.model,
        created_at=gen.created_at,
        completed_at=gen.completed_at,
        error=gen.error,
    )

@router.post("/image-to-image", response_model=GenerateResponse)
def image_to_image(req: GenerateRequest, background_tasks: BackgroundTasks, auth_header: str = Header(default=...), db: Session = Depends(get_db)):
    user = get_current_user(auth_header, db)
    urls = req.image_urls or ([req.image_url] if req.image_url else [])
    if not urls:
        raise HTTPException(status_code=400, detail="At least one image is required")
    gen = Generation(
        user_id=user.id,
        prompt=req.prompt,
        image_url="|".join(urls),
        status="pending",
        model="flux-img2img",
    )
    db.add(gen)
    db.commit()
    db.refresh(gen)
    
    # Trigger background processing
    def run_img2img():
        from app.db import SessionLocal as SL
        db = SL()
        try:
            from app.services.img2img_generator import generate_img2img
            generate_img2img(gen.id, req.prompt, urls, req.strength or 0.6, db)
        finally:
            db.close()

    background_tasks.add_task(run_img2img)
    
    return GenerateResponse(
        id=gen.id,
        prompt=gen.prompt,
        image_url=gen.image_url,
        video_url=gen.video_url,
        status=gen.status,
        model=gen.model,
        created_at=gen.created_at,
        completed_at=gen.completed_at,
        outputs=_get_outputs(gen),
        error=gen.error,
    )

@router.get("/generations", response_model=list[GenerateResponse])
def list_generations(auth_header: str = Header(default=...), db: Session = Depends(get_db)):
    user = get_current_user(auth_header, db)
    gens = db.query(Generation).filter(Generation.user_id == user.id).order_by(Generation.created_at.desc()).all()
    return [
        GenerateResponse(
            id=g.id,
            prompt=g.prompt,
            image_url=g.image_url,
            video_url=g.video_url,
            status=g.status,
            model=g.model,
            created_at=g.created_at,
            completed_at=g.completed_at,
            outputs=_get_outputs(g),
            error=g.error,
        )
        for g in gens
    ]
