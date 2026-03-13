from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import MemberItem


router = APIRouter(tags=["members"])


@router.get("/members", response_model=List[MemberItem])
def list_members(db: Session = Depends(get_db)) -> List[MemberItem]:
    users = db.query(User).filter(User.is_active.is_(True)).all()
    members: List[MemberItem] = []
    for u in users:
        batch = ""
        if u.batch_year and u.department:
            batch = f"{u.batch_year} - {u.department}"
        elif u.batch_year:
            batch = str(u.batch_year)

        members.append(
            MemberItem(
                id=u.id,
                name=u.full_name,
                batch=batch or "Alumni",
                role=u.job_title or "Alumni",
                company=u.current_company or "-",
                location=u.location or "-",
                image=u.photo_url or "",
            )
        )
    return members

