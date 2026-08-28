from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
import base64
import hashlib
import hmac
import json
import os
import time
from typing import Optional
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import get_db
from models import User
from schemas import UserCreate, UserLogin

router = APIRouter(tags=["auth"])
security = HTTPBearer(auto_error=False)
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-development-secret")
ALLOWED_ROLES = {"admin", "student"}


def _encode_token(user: User) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": str(user.id), "role": str(user.role), "exp": int(time.time()) + 60 * 60 * 8}

    def encode(value: dict) -> str:
        return base64.urlsafe_b64encode(json.dumps(value, separators=(",", ":")).encode()).decode().rstrip("=")

    unsigned = f"{encode(header)}.{encode(payload)}"
    signature = hmac.new(JWT_SECRET.encode(), unsigned.encode(), hashlib.sha256).digest()
    return f"{unsigned}.{base64.urlsafe_b64encode(signature).decode().rstrip('=')}"


def _decode_token(token: str) -> dict:
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".")
        unsigned = f"{encoded_header}.{encoded_payload}"
        expected = hmac.new(JWT_SECRET.encode(), unsigned.encode(), hashlib.sha256).digest()
        actual = base64.urlsafe_b64decode(encoded_signature + "===")
        if not hmac.compare_digest(expected, actual):
            raise ValueError
        payload = json.loads(base64.urlsafe_b64decode(encoded_payload + "===").decode())
        if int(payload["exp"]) < int(time.time()):
            raise ValueError
        return payload
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = _decode_token(credentials.credentials)
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or user.role != payload.get("role"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user session")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if str(user.role) != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already registered",
        )

    new_user = User(
        name=user_data.fullName,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        batch_year=user_data.batchYear,
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error registering user. Please try again.",
        )

    # Return shape expected by Login.tsx: { message, user: { id, fullName, email } }
    return {
        "message": "Registered successfully",
        "user": {
            "id": new_user.id,
            "fullName": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
        },
    }


@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()

    if user_data.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid login role")
    if not user or not verify_password(user_data.password, str(user.password_hash)) or str(user.role) != user_data.role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password",
        )

    # Return shape expected by Login.tsx: { token, user: { id, fullName, email } }
    return {
        "message": "Login successful",
        "token": _encode_token(user),
        "user": {
            "id": user.id,
            "fullName": user.name,
            "email": user.email,
            "role": user.role,
        },
    }

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
