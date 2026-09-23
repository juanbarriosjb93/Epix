from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class GenerationCreate(BaseModel):
    prompt: str
    image_url: Optional[str] = None

class GenerationResponse(BaseModel):
    id: str
    prompt: str
    image_url: Optional[str]
    video_url: Optional[str]
    status: str
    model: str
    created_at: datetime
    completed_at: Optional[datetime]

class ErrorResponse(BaseModel):
    detail: str
