from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt

from database import get_db
from models import User
from schemas import UserCreate, UserLogin

router = APIRouter(tags=["auth"])


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
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered",
        )

    new_user = User(
        name=user_data.fullName,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
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
        },
    }


@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password",
        )

    # Return shape expected by Login.tsx: { token, user: { id, fullName, email } }
    return {
        "message": "Login successful",
        "token": f"token-{user.id}",
        "user": {
            "id": user.id,
            "fullName": user.name,
            "email": user.email,
        },
    }


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
