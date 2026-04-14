from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import Optional
import shutil
import uuid
from pathlib import Path

from database import get_db
from models import User
from schemas import AlumniProfileResponse, AlumniProfileUpdate

router = APIRouter(tags=["profile"])

STATIC_PHOTOS_DIR = Path(__file__).resolve().parent.parent / "static" / "photos"
STATIC_PHOTOS_DIR.mkdir(parents=True, exist_ok=True)


def _get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> User:
    """Extract user from the fake token stored as 'token-{id}'."""
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    # Expected format: "Bearer token-{id}"
    try:
        scheme, token = authorization.split(" ", 1)
        if scheme.lower() != "bearer" or not token.startswith("token-"):
            raise ValueError()
        user_id = int(token.split("token-")[1])
    except (ValueError, IndexError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def _user_to_profile(user: User) -> dict:
    return {
        "id": str(user.id),
        "fullName": user.name,
        "email": user.email,
        "phone": user.phone,
        "department": user.department,
        "batchYear": user.batch_year,
        "currentCompany": user.current_company,
        "jobTitle": user.job_title,
        "bio": user.bio,
        "photoUrl": user.photo_url,
    }


@router.get("/me")
def get_profile(user: User = Depends(_get_current_user)):
    return _user_to_profile(user)


@router.put("/me")
def update_profile(
    data: AlumniProfileUpdate,
    user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
):
    if data.fullName is not None:
        user.name = data.fullName #type: ignore
    if data.phone is not None:
        user.phone = data.phone #type: ignore
    if data.department is not None:
        user.department = data.department #type: ignore
    if data.batchYear is not None:
        user.batch_year = data.batchYear #type: ignore
    if data.currentCompany is not None:
        user.current_company = data.currentCompany #type: ignore
    if data.jobTitle is not None:
        user.job_title = data.jobTitle #type: ignore
    if data.bio is not None:
        user.bio = data.bio #type: ignore

    db.commit()
    db.refresh(user)
    return _user_to_profile(user)


@router.post("/me/photo")
def upload_photo(
    photo: UploadFile = File(...),
    user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
):
    ext = Path(photo.filename).suffix if photo.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = STATIC_PHOTOS_DIR / filename

    with open(file_path, "wb") as f:
        shutil.copyfileobj(photo.file, f)

    user.photo_url = f"/static/photos/{filename}" #type: ignore
    db.commit()
    return {"photoUrl": user.photo_url}


@router.get("/me/events")
def get_registered_events(user: User = Depends(_get_current_user)):
    # No event-registration table yet — return empty list
    return []
