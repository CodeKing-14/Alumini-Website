#!/usr/bin/env python3
"""Automated test for Google OAuth Admin Signup with OTP.
Tests:
1. Attempt Google OAuth signup as admin WITHOUT OTP -> 403 Forbidden.
2. Attempt Google OAuth signup as admin WITH FAKE OTP -> 400 Bad Request.
3. Request valid OTP for sritalumni@gmail.com.
4. Google OAuth signup as admin WITH VALID OTP -> 200 OK (user.role == 'admin').
5. Verify user record in MySQL has role == 'admin'.
6. Verify admin can access protected admin endpoints (POST /api/events).
7. Verify new admin is NOT in GET /api/members.
8. Clean up test records.
"""

import sys
from pathlib import Path
import time
import jwt
import os

sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from models import User, AdminOTP

client = TestClient(app)
google_client_id = os.getenv("GOOGLE_CLIENT_ID", "461770927726-e3ae8196kf2b5uukpfa3v6kitu18ckdm.apps.googleusercontent.com")

def test_google_admin_signup():
    print("=" * 60)
    print("TESTING GOOGLE OAUTH ADMINISTRATOR SIGNUP WITH OTP")
    print("=" * 60)

    admin_sub = f"google-sub-admin-{int(time.time())}"
    admin_email = f"google_admin_{int(time.time())}@sritcbe.ac.in"

    mock_google_token = jwt.encode({
        "iss": "https://accounts.google.com",
        "aud": google_client_id,
        "sub": admin_sub,
        "email": admin_email,
        "email_verified": True,
        "name": "Google Admin User",
        "picture": "https://lh3.googleusercontent.com/a/sample-admin",
    }, "sample-secret-32-chars-long-test-key!", algorithm="HS256")

    # 1. Google OAuth admin signup WITHOUT OTP -> 403 Forbidden
    res1 = client.post("/api/auth/google", json={
        "credential": mock_google_token,
        "role": "admin",
    })
    assert res1.status_code == 403, f"Expected 403 for missing OTP, got {res1.status_code}"
    print("✅ 1. Google OAuth Admin signup without OTP blocked: PASSED")

    # 2. Google OAuth admin signup WITH FAKE OTP -> 400 Bad Request
    res2 = client.post("/api/auth/google", json={
        "credential": mock_google_token,
        "role": "admin",
        "otp": "000000",
    })
    assert res2.status_code == 400, f"Expected 400 for fake OTP, got {res2.status_code}"
    print("✅ 2. Google OAuth Admin signup with fake OTP blocked: PASSED")

    # 3. Request valid OTP for sritalumni@gmail.com
    otp_req = client.post("/api/auth/admin-otp/request", json={})
    assert otp_req.status_code == 200
    with SessionLocal() as db:
        latest_otp = db.query(AdminOTP).filter(
            AdminOTP.email == "sritalumni@gmail.com",
            AdminOTP.is_used == False,
        ).order_by(AdminOTP.id.desc()).first()
        valid_otp = latest_otp.otp_code

    print(f"   (Generated valid OTP: {valid_otp})")

    # 4. Google OAuth admin signup WITH VALID OTP -> 200 OK (role == 'admin')
    res4 = client.post("/api/auth/google", json={
        "credential": mock_google_token,
        "role": "admin",
        "otp": valid_otp,
    })
    assert res4.status_code == 200, f"Google OAuth admin signup failed: {res4.text}"
    user_data = res4.json()["user"]
    assert user_data["role"] == "admin", f"Expected admin role, got '{user_data['role']}'"
    assert user_data["email"] == admin_email
    token = res4.json()["token"]
    assert token is not None
    admin_headers = {"Authorization": f"Bearer {token}"}
    print("✅ 4. Google OAuth Admin signup with valid OTP created user as 'admin': PASSED")

    # 5. Verify in MySQL database directly
    with SessionLocal() as db:
        u = db.query(User).filter(User.email == admin_email).first()
        assert u is not None
        assert u.role == "admin", f"Database role expected 'admin', got '{u.role}'"
        assert u.google_id == admin_sub
        assert u.auth_provider == "google"
    print("✅ 5. Verified MySQL database role is strictly 'admin': PASSED")

    # 6. Verify admin can create event with their Google admin token
    event_res = client.post("/api/events", data={
        "title": "Google Admin Test Event",
        "date": "2026-12-15",
        "location": "SRIT Auditorium",
        "description": "Hosted by Google authenticated admin.",
        "eventType": "Offline",
    }, files=[
        ("images", ("g_event.jpg", b"\xff\xd8\xff\xe0testphoto", "image/jpeg"))
    ], headers=admin_headers)
    assert event_res.status_code == 201, f"Event creation with Google admin token failed: {event_res.text}"
    event_id = event_res.json()["id"]
    print("✅ 6. Google Admin token successfully created event: PASSED")

    # 7. Verify Google admin is NOT on members page
    members_res = client.get("/api/members")
    assert members_res.status_code == 200
    member_emails = [m.get("email") for m in members_res.json()]
    assert admin_email not in member_emails, "Google Admin must not be in members directory"
    print("✅ 7. Verified Google Admin is excluded from members directory: PASSED")

    # Clean up test event and user
    client.delete(f"/api/events/{event_id}", headers=admin_headers)
    with SessionLocal() as db:
        u = db.query(User).filter(User.email == admin_email).first()
        if u:
            db.delete(u)
        db.commit()
    print("✅ 8. Cleaned up test records.")

    print("\n" + "=" * 60)
    print("ALL GOOGLE OAUTH ADMIN SIGNUP TESTS PASSED! 🚀")
    print("=" * 60)

if __name__ == "__main__":
    test_google_admin_signup()

