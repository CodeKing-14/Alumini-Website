from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.orm import Session
import shutil
import uuid
from pathlib import Path

from database import get_db
from models import User, AdminOTP
from schemas import AlumniProfileResponse, AlumniProfileUpdate
from routes.auth import get_current_user

router = APIRouter(tags=["profile"])

STATIC_PHOTOS_DIR = Path(__file__).resolve().parent.parent / "static" / "photos"
STATIC_PHOTOS_DIR.mkdir(parents=True, exist_ok=True)


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
        "role": user.role,
    }


@router.get("/me")
def get_profile(user: User = Depends(get_current_user)):
    return _user_to_profile(user)


@router.put("/me")
def update_profile(
    data: AlumniProfileUpdate,
    user: User = Depends(get_current_user),
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
    user: User = Depends(get_current_user),
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
def get_registered_events(user: User = Depends(get_current_user)):
    # No event-registration table yet — return empty list
    return []


@router.delete("/me", status_code=status.HTTP_200_OK)
@router.delete("/profile", status_code=status.HTTP_200_OK)
def delete_account(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permanently delete user account and all associated profile data.
    Works for BOTH student accounts and administrator accounts.
    Automatically removes user from MySQL and alumni members directory immediately.
    """
    user_id = user.id
    user_email = user.email
    user_role = str(user.role)

    # Clean up any OTP records for this email if it was an admin
    try:
        db.query(AdminOTP).filter(AdminOTP.email == user_email).delete()
    except Exception:
        pass

    # Clean up uploaded photo if stored locally
    if user.photo_url and str(user.photo_url).startswith("/static/photos/"):
        photo_filename = str(user.photo_url).replace("/static/photos/", "")
        photo_path = STATIC_PHOTOS_DIR / photo_filename
        if photo_path.exists():
            try:
                photo_path.unlink()
            except Exception:
                pass

    db.delete(user)
    db.commit()

    return {
        "message": "Account successfully deleted",
        "deletedUserId": user_id,
        "email": user_email,
        "role": user_role,
    }
