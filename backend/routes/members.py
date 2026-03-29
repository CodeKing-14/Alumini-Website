from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User

router = APIRouter(tags=["members"])


@router.get("/members")
def get_members(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            # Fields with defaults so the frontend card renders properly
            "batch": "Alumni",
            "role": "Alumni",
            "company": "-",
            "location": "-",
            "image": f"https://ui-avatars.com/api/?name={u.name.replace(' ', '+')}&background=3b82f6&color=fff&size=128",
        }
        for u in users
    ]
