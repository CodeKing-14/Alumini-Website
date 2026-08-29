#!/usr/bin/env python3
"""Debug test script to identify gallery and event creation errors."""

import requests
import json
import sys
import base64
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000/api"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "Admin@12345"

def get_admin_token():
    """Login as admin and return the token."""
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
        "role": "admin",
    })
    print(f"[LOGIN] Status: {resp.status_code}")
    if resp.status_code != 200:
        print(f"[LOGIN] FAILED: {resp.text}")
        return None
    data = resp.json()
    token = data.get("token")
    print(f"[LOGIN] OK - token={token[:30]}...")
    return token


def create_test_image():
    """Create a minimal JPEG file and return its path."""
    path = Path(__file__).parent / "test_image.jpg"
    if not path.exists():
        jpg_b64 = (
            "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsL"
            "DBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/"
            "2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy"
            "MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAARAAEDASIAAhEBAxEB/8QA"
            "FQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQE"
            "BAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMB"
            "AAIRAxEAPwCwAA8A/9k="
        )
        path.write_bytes(base64.b64decode(jpg_b64))
    return path


def test_create_event_with_form(token):
    """Test event creation using multipart form data (matching the FastAPI endpoint)."""
    print("\n=== TEST: Create Event (multipart/form-data) ===")
    headers = {"Authorization": f"Bearer {token}"}
    img_path = create_test_image()

    with open(img_path, "rb") as f:
        resp = requests.post(
            f"{BASE_URL}/events",
            headers=headers,
            data={
                "title": "Debug Test Event",
                "date": "2026-10-01",
                "location": "Main Hall",
                "description": "Testing event creation",
                "eventType": "Offline",
            },
            files=[("images", ("test.jpg", f, "image/jpeg"))],
        )

    print(f"  Status: {resp.status_code}")
    print(f"  Body:   {resp.text[:500]}")

    if resp.status_code == 201:
        print("  PASS")
        return resp.json()
    else:
        print("  FAIL")
        return None


def test_create_event_without_images(token):
    """Test event creation with no images (images field defaults to empty)."""
    print("\n=== TEST: Create Event (no images) ===")
    headers = {"Authorization": f"Bearer {token}"}

    resp = requests.post(
        f"{BASE_URL}/events",
        headers=headers,
        data={
            "title": "No-Image Event",
            "date": "2026-11-01",
            "location": "Room B",
            "description": "Event without images",
            "eventType": "Online",
        },
    )

    print(f"  Status: {resp.status_code}")
    print(f"  Body:   {resp.text[:500]}")

    if resp.status_code == 201:
        print("  PASS")
        return resp.json()
    else:
        print("  FAIL")
        return None


def test_create_gallery(token):
    """Test gallery upload using multipart form data."""
    print("\n=== TEST: Create Gallery Item ===")
    headers = {"Authorization": f"Bearer {token}"}
    img_path = create_test_image()

    with open(img_path, "rb") as f:
        resp = requests.post(
            f"{BASE_URL}/gallery/uploads",
            headers=headers,
            data={
                "title": "Debug Gallery Item",
                "uploadedBy": "Test Admin",
            },
            files=[("images", ("test.jpg", f, "image/jpeg"))],
        )

    print(f"  Status: {resp.status_code}")
    print(f"  Body:   {resp.text[:500]}")

    if resp.status_code == 201:
        print("  PASS")
        return resp.json()
    else:
        print("  FAIL")
        return None


def test_get_events():
    """Test fetching all events."""
    print("\n=== TEST: GET /events ===")
    resp = requests.get(f"{BASE_URL}/events")
    print(f"  Status: {resp.status_code}")

    if resp.status_code == 200:
        data = resp.json()
        print(f"  Count:  {len(data)}")
        if data:
            first = data[0]
            print(f"  First:  id={first.get('id')} title={first.get('title')}")
            print(f"  Keys:   {list(first.keys())}")
        print("  PASS")
    else:
        print(f"  Body: {resp.text[:500]}")
        print("  FAIL")


def test_get_gallery():
    """Test fetching all gallery items."""
    print("\n=== TEST: GET /gallery ===")
    resp = requests.get(f"{BASE_URL}/gallery")
    print(f"  Status: {resp.status_code}")

    if resp.status_code == 200:
        data = resp.json()
        print(f"  Count:  {len(data)}")
        if data:
            first = data[0]
            print(f"  First:  id={first.get('id')} title={first.get('title')}")
            print(f"  Keys:   {list(first.keys())}")
        print("  PASS")
    else:
        print(f"  Body: {resp.text[:500]}")
        print("  FAIL")


if __name__ == "__main__":
    print("=" * 60)
    print("DEBUG TEST: Event & Gallery Database Insertion")
    print("=" * 60)

    token = get_admin_token()
    if not token:
        print("Cannot proceed without admin token.")
        sys.exit(1)

    test_create_event_with_form(token)
    test_create_event_without_images(token)
    test_create_gallery(token)
    test_get_events()
    test_get_gallery()

    print("\n" + "=" * 60)
    print("DEBUG TEST COMPLETE")
    print("=" * 60)
