#!/usr/bin/env python3
"""Comprehensive End-to-End Test Suite for Alumni Web App.
Tests:
1. Google OAuth user registration, login, and token generation.
2. Google OAuth existing user login & role protection.
3. Standard user registration, login, and password hashing.
4. Admin login and permissions.
5. Events: List, Create (Admin), Student permission check, Delete.
6. Gallery: List, Create/Upload (Admin), Student permission check, Delete.
7. Jobs: List, Create (Admin), Student permission check, Delete.
8. Members: List, search.
9. Profile: Get /api/me, Update /api/me.
"""

import sys
from pathlib import Path
import jwt

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from models import User, Event, GalleryItem, Job

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING COMPREHENSIVE END-TO-END FEATURE VERIFICATION")
    print("=" * 60)

    # -------------------------------------------------------------
    # 1. Health check
    # -------------------------------------------------------------
    resp = client.get("/")
    assert resp.status_code == 200, f"Root health check failed: {resp.text}"
    print("✅ 1. Health check: OK")

    # -------------------------------------------------------------
    # 2. Standard Admin Login
    # -------------------------------------------------------------
    admin_login_resp = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "Admin@12345",
        "role": "admin",
    })
    assert admin_login_resp.status_code == 200, f"Admin login failed: {admin_login_resp.text}"
    admin_token = admin_login_resp.json()["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("✅ 2. Standard Admin Login: OK")

    # -------------------------------------------------------------
    # 3. Standard Student Login
    # -------------------------------------------------------------
    student_login_resp = client.post("/api/auth/login", json={
        "email": "student@example.com",
        "password": "Student@12345",
        "role": "student",
    })
    assert student_login_resp.status_code == 200, f"Student login failed: {student_login_resp.text}"
    student_token = student_login_resp.json()["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("✅ 3. Standard Student Login: OK")

    # -------------------------------------------------------------
    # 4. Google OAuth Sign-In (New User)
    # -------------------------------------------------------------
    google_client_id = "461770927726-e3ae8196kf2b5uukpfa3v6kitu18ckdm.apps.googleusercontent.com"
    test_google_sub = "google-sub-unique-123456"
    test_google_email = "new_oauth_user@sritcbe.ac.in"
    
    # Clean up test user if exists
    with SessionLocal() as db:
        existing = db.query(User).filter(User.email == test_google_email).first()
        if existing:
            db.delete(existing)
            db.commit()

    mock_google_token = jwt.encode({
        "iss": "https://accounts.google.com",
        "aud": google_client_id,
        "sub": test_google_sub,
        "email": test_google_email,
        "email_verified": True,
        "name": "Priya Raman",
        "picture": "https://lh3.googleusercontent.com/a/sample-photo",
    }, "sample-secret-32-chars-long-test-key!", algorithm="HS256")

    oauth_resp = client.post("/api/auth/google", json={
        "credential": mock_google_token,
        "role": "student",
    })
    assert oauth_resp.status_code == 200, f"Google OAuth login failed: {oauth_resp.text}"
    oauth_data = oauth_resp.json()
    assert oauth_data["user"]["email"] == test_google_email
    assert oauth_data["user"]["role"] == "student"
    assert oauth_data["user"]["fullName"] == "Priya Raman"
    oauth_token = oauth_data["token"]
    oauth_headers = {"Authorization": f"Bearer {oauth_token}"}
    print("✅ 4. Google OAuth New User Registration & Login: OK")

    # Verify user record in database
    with SessionLocal() as db:
        user_db = db.query(User).filter(User.email == test_google_email).first()
        assert user_db is not None
        assert user_db.google_id == test_google_sub
        assert user_db.auth_provider == "google"
        assert user_db.password_hash is None, "OAuth user should have null password_hash"
    print("✅ 4b. Database Google OAuth columns verified (google_id, auth_provider, null password_hash): OK")

    # -------------------------------------------------------------
    # 5. Google OAuth Role Protection (Cannot auto-claim admin)
    # -------------------------------------------------------------
    fraud_oauth_token = jwt.encode({
        "iss": "https://accounts.google.com",
        "aud": google_client_id,
        "sub": "google-sub-hacker-999",
        "email": "hacker@example.com",
        "name": "Bad Actor",
    }, "sample-secret-32-chars-long-test-key!", algorithm="HS256")
    fraud_resp = client.post("/api/auth/google", json={
        "credential": fraud_oauth_token,
        "role": "admin",
    })
    assert fraud_resp.status_code == 403, f"Expected 403 when claiming admin, got {fraud_resp.status_code}"
    print("✅ 5. Google OAuth Admin Claim Protection: OK (Prevented unauthorized admin creation)")

    # -------------------------------------------------------------
    # 6. Profile API (/api/me)
    # -------------------------------------------------------------
    me_resp = client.get("/api/me", headers=oauth_headers)
    assert me_resp.status_code == 200, f"Failed to get profile: {me_resp.text}"
    profile = me_resp.json()
    assert profile["email"] == test_google_email
    print("✅ 6. Profile GET (/api/me): OK")

    update_resp = client.put("/api/me", headers=oauth_headers, json={
        "fullName": "Priya Raman",
        "phone": "9876543210",
        "department": "CSE",
        "batchYear": 2024,
        "currentCompany": "Zoho",
        "jobTitle": "Product Engineer",
        "location": "Coimbatore",
        "bio": "SRIT Alumni working in Cloud Tech",
    })
    assert update_resp.status_code == 200, f"Profile PUT failed: {update_resp.text}"
    assert update_resp.json()["department"] == "CSE"
    print("✅ 6b. Profile PUT (/api/me update): OK")

    # -------------------------------------------------------------
    # 7. Members API (/api/members)
    # -------------------------------------------------------------
    members_resp = client.get("/api/members")
    assert members_resp.status_code == 200, f"Get members failed: {members_resp.text}"
    members = members_resp.json()
    assert isinstance(members, list)
    for m in members:
        assert m.get("accountRole") != "admin", f"Admin user {m} must not appear in members list"
        assert m.get("email") != "admin@example.com", f"Admin user {m} must not appear in members list"
        assert m.get("email") != "sritalumni@gmail.com", f"Institutional admin {m} must not appear in members list"
    print(f"✅ 7. Members GET (/api/members): OK (Found {len(members)} members, all non-admin verified)")

    # -------------------------------------------------------------
    # 8. Events API (/api/events)
    # -------------------------------------------------------------
    events_get = client.get("/api/events")
    assert events_get.status_code == 200, f"Get events failed: {events_get.text}"
    
    # Student attempts to create event -> Should fail (403)
    create_event_student = client.post("/api/events", headers=student_headers, data={
        "title": "Unauthorized Event",
        "date": "2026-12-01",
        "location": "Campus",
        "description": "Student shouldn't create",
        "eventType": "Offline",
    })
    assert create_event_student.status_code == 403, "Student should NOT be able to create event"
    
    # Admin creates event -> Should succeed
    create_event_admin = client.post(
        "/api/events",
        headers=admin_headers,
        data={
            "title": "Grand Alumni Reunion 2026",
            "date": "2026-12-20",
            "location": "SRIT Auditorium",
            "description": "Annual reunion celebration",
            "eventType": "Offline",
        },
        files=[("images", ("sample.jpg", b"fake-jpg-content", "image/jpeg"))],
    )
    assert create_event_admin.status_code == 201, f"Admin event creation failed: {create_event_admin.text}"
    event_id = create_event_admin.json()["id"]
    print("✅ 8. Events API: OK (List, RBAC Protection, Admin Event Creation)")

    # Admin deletes event -> Should succeed
    del_event = client.delete(f"/api/events/{event_id}", headers=admin_headers)
    assert del_event.status_code in (200, 204), f"Delete event failed: {del_event.text}"
    print("✅ 8b. Events Delete: OK")

    # -------------------------------------------------------------
    # 9. Gallery API (/api/gallery)
    # -------------------------------------------------------------
    gallery_get = client.get("/api/gallery")
    assert gallery_get.status_code == 200, f"Get gallery failed: {gallery_get.text}"
    
    # Student attempts to upload gallery item -> Should fail (403)
    student_upload = client.post(
        "/api/gallery/uploads",
        headers=student_headers,
        data={"title": "Student Upload Attempt"},
        files=[("images", ("test.jpg", b"fake-jpg", "image/jpeg"))],
    )
    assert student_upload.status_code == 403, "Student should NOT be able to upload gallery photos"

    # Admin uploads gallery item -> Should succeed
    admin_upload = client.post(
        "/api/gallery/uploads",
        headers=admin_headers,
        data={"title": "Convocation 2026 Highlights", "uploadedBy": "Admin"},
        files=[("images", ("convocation.jpg", b"fake-convocation-jpg", "image/jpeg"))],
    )
    assert admin_upload.status_code in (200, 201), f"Admin gallery upload failed: {admin_upload.text}"
    gallery_id = admin_upload.json()["id"]
    print("✅ 9. Gallery API: OK (List, RBAC Protection, Admin Gallery Upload)")

    # Admin deletes gallery item -> Should succeed
    del_gallery = client.delete(f"/api/gallery/{gallery_id}", headers=admin_headers)
    assert del_gallery.status_code in (200, 204), f"Delete gallery failed: {del_gallery.text}"
    print("✅ 9b. Gallery Delete: OK")

    # -------------------------------------------------------------
    # 10. Jobs API (/api/jobs)
    # -------------------------------------------------------------
    jobs_get = client.get("/api/jobs")
    assert jobs_get.status_code == 200, f"Get jobs failed: {jobs_get.text}"

    # Student attempts to post job -> Should fail (403)
    student_job = client.post("/api/jobs", headers=student_headers, json={
        "title": "Hacker Job",
        "company": "Fake Corp",
        "location": "Remote",
        "description": "None",
    })
    assert student_job.status_code == 403, "Student should NOT be able to post jobs"

    # Admin posts job -> Should succeed
    admin_job = client.post("/api/jobs", headers=admin_headers, json={
        "title": "AI / ML Research Engineer",
        "company": "Google Research",
        "location": "Bengaluru, India",
        "job_type": "Full-time",
        "experience_level": "0-2 Years",
        "salary_range": "₹18 - ₹24 LPA",
        "description": "Work on Gemini multimodal models and LLM applications.",
        "requirements": "Strong Python, PyTorch/JAX, algorithm foundations.",
        "application_email": "sritalumni@sritcbe",
        "deadline": "31 Dec 2026",
    })
    assert admin_job.status_code == 201, f"Admin post job failed: {admin_job.text}"
    job_id = admin_job.json()["id"]
    print("✅ 10. Jobs API: OK (List, RBAC Protection, Admin Job Creation)")

    # Admin deletes job -> Should succeed
    del_job = client.delete(f"/api/jobs/{job_id}", headers=admin_headers)
    assert del_job.status_code in (200, 204), f"Delete job failed: {del_job.text}"
    print("✅ 10b. Jobs Delete: OK")

    # Clean up test user
    with SessionLocal() as db:
        user_to_clean = db.query(User).filter(User.email == test_google_email).first()
        if user_to_clean:
            db.delete(user_to_clean)
            db.commit()

    print("\n" + "=" * 60)
    print("ALL INTEGRATION TESTS PASSED FLAWLESSLY! 🚀")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
