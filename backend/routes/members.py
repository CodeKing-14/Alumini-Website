from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User

router = APIRouter(tags=["members"])


@router.get("/members")
def get_members(db: Session = Depends(get_db)):
    users = db.query(User).all()
    members_list = []
    for u in users:
        batch_parts = []
        if u.batch_year:
            batch_parts.append(str(u.batch_year))
        if u.department:
            batch_parts.append(u.department)
        batch = " - ".join(batch_parts) if batch_parts else "Alumni"

        image = u.photo_url if u.photo_url else f"https://ui-avatars.com/api/?name={u.name.replace(' ', '+')}&background=3b82f6&color=fff&size=128"

        members_list.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "batch": batch,
            "role": u.job_title if u.job_title else "Professional",
            "company": u.current_company if u.current_company else "-",
            "location": "-",
            "image": image,
        })
    return members_list
