from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Event
from schemas import EventResponse

router = APIRouter(tags=["events"])

@router.get("/events", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    events = db.query(Event).all()
    return events
