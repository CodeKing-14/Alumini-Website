from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from models import Event
from schemas import EventCreate, EventResponse
from routes.auth import require_admin
from models import User

router = APIRouter(tags=["events"])

@router.get("/events", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    events = db.query(Event).all()
    return events


@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    event = Event(**event_data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
