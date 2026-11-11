import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import User, Job
from schemas import JobCreate
from routes.jobs import get_jobs, get_job, create_job, delete_job
from fastapi import HTTPException

def run_tests():
    db = SessionLocal()
    try:
        # 1. Ensure test admin and student exist
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            admin = User(name="Admin Tester", email="admin_test@srit.edu", password_hash="dummy", role="admin")
            db.add(admin)
            db.commit()
            db.refresh(admin)

        student = db.query(User).filter(User.role == "student").first()
        if not student:
            student = User(name="Student Tester", email="student_test@srit.edu", password_hash="dummy", role="student")
            db.add(student)
            db.commit()
            db.refresh(student)

        print("1. Testing get_jobs()...")
        jobs = get_jobs(search=None, job_type=None, db=db)
        assert isinstance(jobs, list), "Expected list of jobs"
        print(f"   [OK] Retrieved {len(jobs)} jobs from database")

        print("2. Testing create_job() with admin user...")
        job_in = JobCreate(
            title="Senior Cloud Architect",
            company="Microsoft Azure",
            location="Bengaluru / Remote, India",
            jobType="Full-time",
            experienceLevel="3 - 5 Years",
            salaryRange="₹24.0 - ₹32.0 LPA",
            description="Design next generation resilient cloud architectures for enterprise customers.",
            requirements="Azure Solutions Architect certification, Kubernetes, Terraform, Go/Python.",
            applicationEmail="sritalumni@sritcbe",
            deadline="31 Dec 2026"
        )
        created = create_job(job_in=job_in, db=db, admin=admin)
        assert created.id is not None
        assert created.title == "Senior Cloud Architect"
        assert created.application_email == "sritalumni@sritcbe"
        print(f"   [OK] Job created with ID: {created.id}")

        print("3. Testing get_job(job_id)...")
        fetched = get_job(job_id=created.id, db=db)
        assert fetched.id == created.id
        assert fetched.company == "Microsoft Azure"
        print("   [OK] Single job fetched successfully")

        print("4. Testing delete_job(job_id) with admin...")
        delete_job(job_id=created.id, db=db, admin=admin)
        print("   [OK] Job deleted successfully")

        # Verify 404 on deleted job
        try:
            get_job(job_id=created.id, db=db)
            assert False, "Should have raised 404"
        except HTTPException as exc:
            assert exc.status_code == 404
            print("   [OK] Correctly raised 404 for deleted job")

        print("\nALL BACKEND ROUTE & MODEL TESTS PASSED!")

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
