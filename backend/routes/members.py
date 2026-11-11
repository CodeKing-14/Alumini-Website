from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import os

from database import get_db
from models import User

router = APIRouter(tags=["members"])
ADMIN_VERIFICATION_EMAIL = os.getenv("ADMIN_VERIFICATION_EMAIL", "sritalumni@gmail.com").strip().lower()


@router.get("/members")
def get_members(db: Session = Depends(get_db)):
    """Retrieve only regular students / alumni members.
    Strict restriction: Administrators (newly created or existing) are NEVER displayed in the members directory.
    """
    users = (
        db.query(User)
        .filter(
            func.lower(User.role) == "student",
            func.lower(User.role) != "admin",
            ~func.lower(User.role).like("%admin%"),
            func.lower(User.email) != ADMIN_VERIFICATION_EMAIL,
        )
        .all()
    )
    members_list = []
    for u in users:
        # Extra defensive check in application logic
        user_role = str(u.role or "").strip().lower()
        user_email = str(u.email or "").strip().lower()
        if user_role == "admin" or "admin" in user_role or user_email == ADMIN_VERIFICATION_EMAIL:
            continue

        batch_parts = []
        if u.batch_year: #type: ignore
            batch_parts.append(str(u.batch_year))
        if u.department: #type: ignore
            batch_parts.append(u.department)
        batch = " - ".join(batch_parts) if batch_parts else "Alumni"

        image = (
            u.photo_url
            if u.photo_url
            else f"https://ui-avatars.com/api/?name={u.name.replace(' ', '+')}&background=3b82f6&color=fff&size=128" #type: ignore
        )

        members_list.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "batch": batch,
            "role": u.job_title if u.job_title else "Professional", #type: ignore
            "accountRole": u.role,
            "company": u.current_company if u.current_company else "-", #type: ignore
            "location": "-",
            "image": image,
        })
    return members_list
