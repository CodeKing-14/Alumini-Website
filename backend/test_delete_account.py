#!/usr/bin/env python3
"""Automated tests for Delete Account feature.
Tests:
1. Create a student user.
2. Verify user is in database and appears in GET /api/members.
3. Authenticate and call DELETE /api/me.
4. Verify user is permanently removed from the MySQL database.
5. Verify user is automatically GONE from GET /api/members.
6. Verify previous token is invalidated (returns 401).
7. Test unauthorized DELETE /api/me without token (returns 401).
"""

import sys
from pathlib import Path
import time

sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from models import User

client = TestClient(app)

def test_delete_account():
    print("=" * 60)
    print("TESTING DELETE ACCOUNT WORKFLOW (DB & MEMBERS REMOVAL)")
    print("=" * 60)

    # 1. Register a new student account
    test_email = f"delete_me_{int(time.time())}@sritcbe.ac.in"
    reg_resp = client.post("/api/auth/register", json={
        "fullName": "Student Deletion Test",
        "email": test_email,
        "password": "Password@123",
        "batchYear": 2023,
        "role": "student",
    })
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    reg_data = reg_resp.json()
    token = reg_data["token"]
    user_id = reg_data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ 1. Registered test student '{test_email}' (ID: {user_id}): PASSED")

    # 2. Verify student appears in database and GET /api/members
    with SessionLocal() as db:
        u = db.query(User).filter(User.id == user_id).first()
        assert u is not None, "User should exist in database"
    
    members_resp = client.get("/api/members")
    assert members_resp.status_code == 200
    members = members_resp.json()
    member_emails = [m.get("email") for m in members]
    assert test_email in member_emails, f"Test user '{test_email}' should be present in members page"
    print(f"✅ 2. Verified user is present in database and listed on /api/members: PASSED")

    # 3. Call DELETE /api/me with valid Bearer token
    del_resp = client.delete("/api/me", headers=headers)
    assert del_resp.status_code == 200, f"Delete account failed: {del_resp.text}"
    del_body = del_resp.json()
    assert del_body["deletedUserId"] == user_id
    assert del_body["email"] == test_email
    print(f"✅ 3. DELETE /api/me executed successfully: {del_body['message']}: PASSED")

    # 4. Verify user is permanently removed from the MySQL database
    with SessionLocal() as db:
        u_after = db.query(User).filter(User.id == user_id).first()
        assert u_after is None, "User must NOT exist in MySQL after deletion!"
    print(f"✅ 4. Verified user {user_id} was automatically deleted from MySQL: PASSED")

    # 5. Verify user is automatically removed from GET /api/members
    members_resp_after = client.get("/api/members")
    assert members_resp_after.status_code == 200
    members_after = members_resp_after.json()
    member_emails_after = [m.get("email") for m in members_after]
    assert test_email not in member_emails_after, f"Deleted user '{test_email}' must NOT appear in members page!"
    print(f"✅ 5. Verified deleted user is automatically REMOVED from /api/members: PASSED")

    # 6. Verify token is now invalid / unauthorized on protected endpoints
    profile_resp = client.get("/api/me", headers=headers)
    assert profile_resp.status_code == 401, f"Expected 401 for deleted user session, got {profile_resp.status_code}"
    print(f"✅ 6. Verified deleted user session is invalidated (returns 401 Unauthorized): PASSED")

    # 7. Unauthenticated DELETE /api/me should be rejected
    unauth_resp = client.delete("/api/me")
    assert unauth_resp.status_code == 401, f"Expected 401 without token, got {unauth_resp.status_code}"
    print("✅ 7. Unauthenticated delete request properly blocked with 401: PASSED")

    # 8. Test Admin Account Deletion (Deleting an Administrator Account)
    from models import AdminOTP
    admin_test_email = f"delete_admin_{int(time.time())}@sritcbe.ac.in"
    otp_req = client.post("/api/auth/admin-otp/request", json={})
    assert otp_req.status_code == 200
    with SessionLocal() as db:
        latest_otp = db.query(AdminOTP).filter(
            AdminOTP.email == "sritalumni@gmail.com",
            AdminOTP.is_used == False,
        ).order_by(AdminOTP.id.desc()).first()
        admin_otp_code = latest_otp.otp_code

    admin_reg = client.post("/api/auth/register", json={
        "fullName": "Admin To Delete",
        "email": admin_test_email,
        "password": "AdminPassword@123",
        "role": "admin",
        "otp": admin_otp_code,
    })
    assert admin_reg.status_code == 201
    admin_token = admin_reg.json()["token"]
    admin_id = admin_reg.json()["user"]["id"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(f"✅ 8a. Created test administrator account '{admin_test_email}' (ID: {admin_id})")

    # Verify admin exists in DB
    with SessionLocal() as db:
        admin_u = db.query(User).filter(User.id == admin_id).first()
        assert admin_u is not None and admin_u.role == "admin"

    # Administrator calls DELETE /api/me
    admin_del_resp = client.delete("/api/me", headers=admin_headers)
    assert admin_del_resp.status_code == 200, f"Admin deletion failed: {admin_del_resp.text}"
    assert admin_del_resp.json()["deletedUserId"] == admin_id
    print(f"✅ 8b. Administrator successfully deleted account via DELETE /api/me: PASSED")

    # Verify admin is permanently removed from MySQL
    with SessionLocal() as db:
        assert db.query(User).filter(User.id == admin_id).first() is None
    print(f"✅ 8c. Verified administrator was permanently removed from MySQL database: PASSED")

    # Verify admin token is invalidated
    admin_check = client.get("/api/me", headers=admin_headers)
    assert admin_check.status_code == 401
    print(f"✅ 8d. Verified deleted administrator token is invalidated (401): PASSED")

    print("\n" + "=" * 60)
    print("ALL DELETE ACCOUNT TESTS (STUDENT & ADMIN) PASSED FLAWLESSLY! 🚀")
    print("=" * 60)

if __name__ == "__main__":
    test_delete_account()

