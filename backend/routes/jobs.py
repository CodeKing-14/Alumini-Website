from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models import Job, User
from schemas import JobResponse, JobCreate
from routes.auth import require_admin

router = APIRouter(tags=["jobs"])


@router.get("/jobs", response_model=List[JobResponse])
def get_jobs(
    search: Optional[str] = Query(None, description="Search by title, company, or location"),
    job_type: Optional[str] = Query(None, alias="jobType", description="Filter by job type"),
    db: Session = Depends(get_db),
):
    """Retrieve all jobs posted by admins. Open to all students and alumni."""
    query = db.query(Job)

    if job_type and job_type.strip() and job_type.lower() != "all":
        query = query.filter(Job.job_type == job_type.strip())

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (Job.title.ilike(term))
            | (Job.company.ilike(term))
            | (Job.location.ilike(term))
            | (Job.description.ilike(term))
        )

    return query.order_by(Job.id.desc()).all()


@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Retrieve a single job posting by ID."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )
    return job


@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new job posting. Admin access ONLY."""
    # Ensure title and company are clean
    title = job_in.title.strip()
    company = job_in.company.strip()
    location = job_in.location.strip()
    description = job_in.description.strip()

    if not title or not company or not location or not description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title, company, location, and description are required",
        )

    # Every job defaults application email to 'sritalumni@sritcbe' if blank
    app_email = (job_in.applicationEmail or "sritalumni@sritcbe").strip()
    if not app_email:
        app_email = "sritalumni@sritcbe"

    new_job = Job(
        title=title,
        company=company,
        location=location,
        job_type=(job_in.jobType or "Full-time").strip(),
        experience_level=(job_in.experienceLevel.strip() if job_in.experienceLevel else None),
        salary_range=(job_in.salaryRange.strip() if job_in.salaryRange else None),
        description=description,
        requirements=(job_in.requirements.strip() if job_in.requirements else None),
        application_email=app_email,
        deadline=(job_in.deadline.strip() if job_in.deadline else None),
        posted_by=admin.name or admin.email,
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a job posting. Admin access ONLY."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )

    db.delete(job)
    db.commit()
    return None
