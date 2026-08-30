from typing import List, Optional
from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
import base64

from database import get_db
from models import Event, EventImage, User
from schemas import EventResponse
from routes.auth import require_admin

router = APIRouter(tags=["events"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


@router.get("/events", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.id.desc()).all()


@router.get("/events/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    title: str = Form(...),
    date: str = Form(...),
    location: str = Form(...),
    description: str = Form(""),
    eventType: str = Form("Offline"),
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    if not date.strip():
        raise HTTPException(status_code=400, detail="Date is required")
    if not location.strip():
        raise HTTPException(status_code=400, detail="Location is required")

    # `images` can contain a single empty placeholder UploadFile when the
    # browser submits the field with no file selected — skip those.
    real_files = [img for img in images if img is not None and img.filename]

    saved_data_urls: list[str] = []

    for image in real_files:
        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"'{image.filename}' is not a supported image type (use JPEG, PNG, GIF, or WEBP)",
            )
        content = await image.read()
        b64 = base64.b64encode(content).decode("utf-8")
        mime = image.content_type or "image/jpeg"
        data_url = f"data:{mime};base64,{b64}"
        saved_data_urls.append(data_url)

    event = Event(
        title=title.strip(),
        description=description.strip() or None,
        date=date.strip(),
        location=location.strip(),
        event_type=eventType.strip() or "Offline",
        image_url=None,  # no longer using file path
        images=[EventImage(image_data=data_url) for data_url in saved_data_urls],
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()

    return None


@router.post("/events/{event_id}/photos", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_event_photo(
    event_id: int,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if photo.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"'{photo.filename}' is not a supported image type (use JPEG, PNG, GIF, or WEBP)",
        )

    content = await photo.read()
    b64 = base64.b64encode(content).decode("utf-8")
    mime = photo.content_type or "image/jpeg"
    data_url = f"data:{mime};base64,{b64}"

    event_image = EventImage(event_id=event.id, image_data=data_url)
    db.add(event_image)
    db.commit()
    db.refresh(event_image)

    return {
        "id": event_image.id,
        "event_id": event_image.event_id,
        "image_url": event_image.image_data,
        "uploaded_at": str(event.created_at),
    }
