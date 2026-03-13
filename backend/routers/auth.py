from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt

from database import get_db
from models import User
from schemas import UserCreate, UserLogin


router = APIRouter(tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Secret - In production, use environment variable
JWT_SECRET = "your-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60


def _get_password_hash(password: str) -> str:
    # bcrypt limit: truncate to 72 bytes (UTF-8 encoded)
    if len(password.encode('utf-8')) > 72:
        password_bytes = password.encode('utf-8')[:72]
        password = password_bytes.decode('utf-8', errors='ignore')
    return pwd_context.hash(password)


def _verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def _create_jwt_token(user_id: int, email: str) -> str:
    """Create JWT token for authenticated user"""
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": expire
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


@router.post("/auth/register")
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = User(
        full_name=payload.fullName,
        email=payload.email,
        password_hash=_get_password_hash(payload.password),
        batch_year=payload.batchYear,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Registered successfully",
        "user": {
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
        },
    }


@router.post("/auth/login")
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not _verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Create JWT token
    token = _create_jwt_token(user.id, user.email)

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
        },
    }


@router.post("/auth/logout")
def logout_user():
    """Logout endpoint - client should remove token from localStorage"""
    return {"message": "Logout successful"}

