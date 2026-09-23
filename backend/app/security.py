from datetime import datetime, timedelta
from jose import JWTError, jwt
import hashlib
import hmac
import base64
import os

SECRET_KEY = os.getenv("SECRET_KEY", "epix-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    pwd = password.encode("utf-8")[:72]
    hash_bytes = hashlib.pbkdf2_hmac("sha256", pwd, salt, 100000)
    return base64.b64encode(salt + hash_bytes).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        decoded = base64.b64decode(hashed.encode("utf-8"))
        salt = decoded[:16]
        stored_hash = decoded[16:]
        pwd = plain.encode("utf-8")[:72]
        new_hash = hashlib.pbkdf2_hmac("sha256", pwd, salt, 100000)
        return hmac.compare_digest(stored_hash, new_hash)
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
