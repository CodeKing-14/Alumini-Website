from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Event
from schemas import EventPublic


router = APIRouter(tags=["events"])


@router.get("/events", response_model=List[EventPublic])
def list_events(db: Session = Depends(get_db)) -> List[EventPublic]:
    events = db.query(Event).order_by(Event.id.desc()).all()
    # If no events in DB, return an empty list; frontend will use its static fallback.
    return [
        EventPublic(
            id=e.id,
            title=e.title,
            date=e.date_text,
            location=e.location,
            eventType=e.event_type,
            purpose=e.purpose,
            image=e.image,
            description=e.description,
        )
        for e in events
    ]

