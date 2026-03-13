from pathlib import Path
from typing import List
import jwt

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Header
from sqlalchemy.orm import Session

from database import get_db
from models import User, EventRegistration
from schemas import AlumniProfile, AlumniProfileUpdate, PhotoUploadResponse, RegisteredEvent


router = APIRouter(tags=["profile"])

# JWT Secret - must match the one in auth.py
JWT_SECRET = "your-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"


def _get_current_user_id(authorization: str | None) -> int:
    """Extract user ID from JWT token in Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Remove "Bearer " prefix if present
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def _get_user_from_token(db: Session, authorization: str | None) -> User:
    """Get the currently authenticated user from JWT token"""
    user_id = _get_current_user_id(authorization)
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/me", response_model=AlumniProfile)
def get_me(authorization: str = Header(None), db: Session = Depends(get_db)) -> AlumniProfile:
    user = _get_user_from_token(db, authorization)
    return AlumniProfile(
        id=str(user.id),
        fullName=user.full_name,
        email=user.email,
        phone=user.phone,
        department=user.department,
        batchYear=user.batch_year,
        currentCompany=user.current_company,
        jobTitle=user.job_title,
        location=user.location,
        bio=user.bio,
        photoUrl=user.photo_url,
    )


@router.put("/me", response_model=AlumniProfile)
def update_me(
    payload: AlumniProfileUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> AlumniProfile:
    user = _get_user_from_token(db, authorization)

    if payload.fullName is not None:
        user.full_name = payload.fullName
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.department is not None:
        user.department = payload.department
    if payload.batchYear is not None:
        user.batch_year = payload.batchYear
    if payload.currentCompany is not None:
        user.current_company = payload.currentCompany
    if payload.jobTitle is not None:
        user.job_title = payload.jobTitle
    if payload.location is not None:
        user.location = payload.location
    if payload.bio is not None:
        user.bio = payload.bio

    db.add(user)
    db.commit()
    db.refresh(user)

    return AlumniProfile(
        id=str(user.id),
        fullName=user.full_name,
        email=user.email,
        phone=user.phone,
        department=user.department,
        batchYear=user.batch_year,
        currentCompany=user.current_company,
        jobTitle=user.job_title,
        location=user.location,
        bio=user.bio,
        photoUrl=user.photo_url,
    )


@router.post("/me/photo", response_model=PhotoUploadResponse)
async def upload_photo(
    photo: UploadFile = File(...),
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> PhotoUploadResponse:
    if not photo.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    user = _get_user_from_token(db, authorization)

    uploads_dir = Path(__file__).resolve().parent.parent / "static" / "profiles"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(photo.filename).suffix or ".jpg"
    file_name = f"user_{user.id}{ext}"
    file_path = uploads_dir / file_name

    content = await photo.read()
    file_path.write_bytes(content)

    photo_url = f"/static/profiles/{file_name}"
    user.photo_url = photo_url

    db.add(user)
    db.commit()

    return PhotoUploadResponse(photoUrl=photo_url)


@router.get("/me/events", response_model=List[RegisteredEvent])
def get_my_events(authorization: str = Header(None), db: Session = Depends(get_db)) -> List[RegisteredEvent]:
    user = _get_user_from_token(db, authorization)
    regs = (
        db.query(EventRegistration)
        .join(EventRegistration.event)
        .filter(EventRegistration.user_id == user.id)
        .all()
    )

    events: List[RegisteredEvent] = []
    for r in regs:
        e = r.event
        if e is None:
            continue
        events.append(
            RegisteredEvent(
                id=str(e.id),
                title=e.title,
                dateISO=e.date_text,
                location=e.location,
                status=r.status,
            )
        )

    return events

