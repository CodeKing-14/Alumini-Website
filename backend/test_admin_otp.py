#!/usr/bin/env python3
"""Automated tests for Administrator OTP Verification Flow.
Tests:
1. Normal student registration does not require OTP.
2. Admin registration fails if OTP is missing.
3. Admin registration fails if OTP is invalid.
4. POST /api/auth/admin-otp/request generates OTP for sritalumni@gmail.com.
5. Admin registration succeeds with valid OTP.
6. Re-using same OTP is rejected.
7. New admin can log in and has full admin permissions.
"""

import sys
from pathlib import Path
import time

sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from models import User, AdminOTP

client = TestClient(app)

def test_admin_otp_flow():
    print("=" * 60)
    print("TESTING ADMINISTRATOR OTP VERIFICATION FLOW")
    print("=" * 60)

    # 1. Student registration without OTP -> SUCCESS
    student_email = f"student_test_{int(time.time())}@sritcbe.ac.in"
    res1 = client.post("/api/auth/register", json={
        "fullName": "Student Test",
        "email": student_email,
        "password": "Password@123",
        "batchYear": 2024,
        "role": "student",
    })
    assert res1.status_code == 201, f"Student registration failed: {res1.text}"
    assert res1.json()["user"]["role"] == "student"
    print("✅ 1. Student registration without OTP: PASSED")

    # 2. Admin registration without OTP -> SHOULD FAIL (400)
    admin_email = f"admin_test_{int(time.time())}@sritcbe.ac.in"
    res2 = client.post("/api/auth/register", json={
        "fullName": "Unauthorized Admin Attempt",
        "email": admin_email,
        "password": "Password@123",
        "role": "admin",
    })
    assert res2.status_code == 400, f"Expected 400 for missing OTP, got {res2.status_code}"
    print("✅ 2. Admin registration blocked when OTP missing: PASSED")

    # 3. Admin registration with fake OTP -> SHOULD FAIL (400)
    res3 = client.post("/api/auth/register", json={
        "fullName": "Fake OTP Admin",
        "email": admin_email,
        "password": "Password@123",
        "role": "admin",
        "otp": "999999",
    })
    assert res3.status_code == 400, f"Expected 400 for fake OTP, got {res3.status_code}"
    print("✅ 3. Admin registration blocked with invalid OTP: PASSED")

    # 4. Request OTP for sritalumni@gmail.com -> SUCCESS
    res4 = client.post("/api/auth/admin-otp/request", json={})
    assert res4.status_code == 200, f"Failed to request OTP: {res4.text}"
    otp_data = res4.json()
    assert otp_data["targetEmail"] == "sritalumni@gmail.com"
    print(f"✅ 4. OTP successfully generated and sent to sritalumni@gmail.com: PASSED")

    # Retrieve the OTP from DB to test the verification
    with SessionLocal() as db:
        latest_otp = db.query(AdminOTP).filter(
            AdminOTP.email == "sritalumni@gmail.com",
            AdminOTP.is_used == False,
        ).order_by(AdminOTP.id.desc()).first()
        assert latest_otp is not None, "OTP record not found in database!"
        valid_otp = latest_otp.otp_code

    print(f"   (Verified generated OTP code: {valid_otp})")

    # 5. Admin registration with VALID OTP -> SUCCESS & Token Returned
    res5 = client.post("/api/auth/register", json={
        "fullName": "Authorized New Admin",
        "email": admin_email,
        "password": "AdminPassword@123",
        "role": "admin",
        "otp": valid_otp,
    })
    assert res5.status_code == 201, f"Admin registration with valid OTP failed: {res5.text}"
    reg_body = res5.json()
    registered_admin = reg_body["user"]
    assert registered_admin["role"] == "admin"
    assert registered_admin["email"] == admin_email
    assert "token" in reg_body and reg_body["token"], "Registration must return JWT token for immediate auto-login"
    auto_token = reg_body["token"]
    print("✅ 5. Admin registration with valid OTP (auto-token returned): PASSED")

    # 6. Attempt to RE-USE the same OTP -> SHOULD FAIL (400)
    admin_email_2 = f"admin_second_{int(time.time())}@sritcbe.ac.in"
    res6 = client.post("/api/auth/register", json={
        "fullName": "Replay Attack Admin",
        "email": admin_email_2,
        "password": "AdminPassword@123",
        "role": "admin",
        "otp": valid_otp,
    })
    assert res6.status_code == 400, f"Expected 400 for reused OTP, got {res6.status_code}"
    print("✅ 6. OTP replay / re-use blocked: PASSED")

    # 7. Log in as the newly created Admin even if UI dropdown defaulted to 'student' -> SUCCESS
    login_res = client.post("/api/auth/login", json={
        "email": admin_email,
        "password": "AdminPassword@123",
        "role": "student",  # dropdown default
    })
    assert login_res.status_code == 200, f"New admin login failed: {login_res.text}"
    login_data = login_res.json()
    assert login_data["user"]["role"] == "admin", f"Expected admin role in login response, got {login_data['user']['role']}"
    token = login_data["token"]
    assert token is not None
    admin_headers = {"Authorization": f"Bearer {token}"}
    print("✅ 7. Newly registered Administrator logged in successfully with full admin role: PASSED")

    # 7b. Verify New & Existing Admin are excluded from Members Directory
    members_res = client.get("/api/members")
    assert members_res.status_code == 200
    current_members = members_res.json()
    member_emails = [m.get("email") for m in current_members]
    assert admin_email not in member_emails, "Newly registered admin MUST NOT appear in members directory"
    assert "admin@example.com" not in member_emails, "Existing admin MUST NOT appear in members directory"
    assert "sritalumni@gmail.com" not in member_emails, "Institutional admin MUST NOT appear in members directory"
    print("✅ 7b. Verified new & existing administrators are STRICTLY excluded from members directory: PASSED")

    # 8. Test Admin Privileges with New Admin Token:
    # 8a. Create Event
    event_res = client.post("/api/events", data={
        "title": "New Admin Inaugural Meetup",
        "date": "2026-12-01",
        "location": "SRIT Main Campus",
        "description": "Hosted by newly verified administrator.",
        "eventType": "Offline",
    }, files=[
        ("images", ("event_test.jpg", b"\xff\xd8\xff\xe0testimagecontent", "image/jpeg"))
    ], headers=admin_headers)
    assert event_res.status_code == 201, f"New admin event creation failed: {event_res.text}"
    created_event_id = event_res.json()["id"]
    print(f"✅ 8a. New Admin successfully created event (ID: {created_event_id}): PASSED")

    # 8b. Upload Gallery Item
    gallery_res = client.post("/api/gallery/uploads", data={
        "title": "New Admin Photo Album",
        "uploadedBy": "Authorized Admin",
    }, files=[
        ("images", ("album1.jpg", b"\xff\xd8\xff\xe0testphotodata", "image/jpeg"))
    ], headers=admin_headers)
    assert gallery_res.status_code == 201, f"New admin gallery upload failed: {gallery_res.text}"
    created_gallery_id = gallery_res.json()["id"]
    print(f"✅ 8b. New Admin successfully uploaded photo to gallery (ID: {created_gallery_id}): PASSED")

    # 8c. Post Job
    job_res = client.post("/api/jobs", json={
        "title": "Senior Cloud Engineer",
        "company": "SRIT Alumni Tech",
        "location": "Coimbatore / Remote",
        "jobType": "Full-time",
        "description": "Leading cloud architecture initiatives.",
        "applicationEmail": "sritalumni@gmail.com",
    }, headers=admin_headers)
    assert job_res.status_code == 201, f"New admin job posting failed: {job_res.text}"
    created_job_id = job_res.json()["id"]
    print(f"✅ 8c. New Admin successfully posted job opening (ID: {created_job_id}): PASSED")

    # Clean up test records
    client.delete(f"/api/events/{created_event_id}", headers=admin_headers)
    client.delete(f"/api/gallery/{created_gallery_id}", headers=admin_headers)
    client.delete(f"/api/jobs/{created_job_id}", headers=admin_headers)

    with SessionLocal() as db:
        for em in [student_email, admin_email]:
            u = db.query(User).filter(User.email == em).first()
            if u:
                db.delete(u)
        db.commit()
    print("✅ 9. Test records and new admin test user cleaned up cleanly.")

    print("\n" + "=" * 60)
    print("ALL ADMINISTRATOR OTP VERIFICATION TESTS PASSED! 🚀")
    print("=" * 60)

if __name__ == "__main__":
    test_admin_otp_flow()

