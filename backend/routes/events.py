from typing import List, Optional
from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from pathlib import Path
import uuid

from database import get_db
from models import Event, EventImage, User
from schemas import EventResponse
from routes.auth import require_admin

router = APIRouter(tags=["events"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


@router.get("/events", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.id.desc()).all()


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

    uploads_dir = Path(__file__).resolve().parent.parent / "static" / "events"
    saved_urls: list[str] = []

    # `images` can contain a single empty placeholder UploadFile when the
    # browser submits the field with no file selected — skip those instead
    # of erroring, so events without any image still save correctly.
    real_files = [img for img in images if img is not None and img.filename]

    if real_files:
        uploads_dir.mkdir(parents=True, exist_ok=True)
        for image in real_files:
            if image.content_type not in ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"'{image.filename}' is not a supported image type (use JPEG, PNG, GIF, or WEBP)",
                )
            ext = Path(image.filename).suffix or ".jpg"
            file_name = f"{uuid.uuid4().hex}{ext}"
            file_path = uploads_dir / file_name

            content = await image.read()
            file_path.write_bytes(content)

            # URL path that matches StaticFiles mount
            saved_urls.append(f"/static/events/{file_name}")

    event = Event(
        title=title.strip(),
        description=description.strip() or None,
        date=date.strip(),
        location=location.strip(),
        event_type=eventType.strip() or "Offline",
        image_url=saved_urls[0] if saved_urls else None,  # cover image
        images=[EventImage(image_url=url) for url in saved_urls],
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

    static_root = Path(__file__).resolve().parent.parent / "static"
    for url in event.image_urls:  # type: ignore
        relative = str(url).split("/static/")[-1]
        file_path = static_root / relative
        if file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                pass

    db.delete(event)  # cascades to event_images rows
    db.commit()
    return None
