#!/usr/bin/env python3
"""Test script to verify admin login and event/gallery uploads"""

import requests
import json
from pathlib import Path
import sys

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000/api"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "Admin@12345"
STUDENT_EMAIL = "student@example.com"
STUDENT_PASSWORD = "Student@12345"

def test_admin_login():
    """Test admin login and token generation"""
    print("\n=== Testing Admin Login ===")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "role": "admin"
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        token = response.json().get("token")
        user = response.json().get("user")
        print(f"✅ Admin login successful!")
        print(f"   Token: {token[:20]}...")
        print(f"   User: {user['fullName']} ({user['role']})")
        return token, user
    else:
        print(f"❌ Admin login failed!")
        return None, None

def test_student_login():
    """Test student login"""
    print("\n=== Testing Student Login ===")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD,
            "role": "student"
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        token = response.json().get("token")
        user = response.json().get("user")
        print(f"✅ Student login successful!")
        print(f"   Token: {token[:20]}...")
        print(f"   User: {user['fullName']} ({user['role']})")
        return token
    else:
        print(f"❌ Student login failed!")
        return None

def test_create_event(admin_token):
    """Test creating an event as admin"""
    print("\n=== Testing Event Creation (Admin) ===")
    
    if not admin_token:
        print("❌ No admin token provided, skipping...")
        return None
    
    event_data = {
        "title": "Test Event: Tech Meetup 2026",
        "date": "2026-09-15",
        "location": "Conference Hall A",
        "description": "A test event for alumni network",
        "eventType": "Offline",
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    response = requests.post(
        f"{BASE_URL}/events",
        data=event_data,
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        event = response.json()
        print(f"✅ Event created successfully!")
        print(f"   ID: {event['id']}")
        print(f"   Title: {event['title']}")
        return event['id']
    else:
        print(f"❌ Event creation failed!")
        return None

def test_student_cannot_create_event(student_token):
    """Test that student cannot create events"""
    print("\n=== Testing Student Cannot Create Events ===")
    
    if not student_token:
        print("❌ No student token provided, skipping...")
        return
    
    event_data = {
        "title": "Unauthorized Event",
        "date": "2026-09-15",
        "location": "Test",
        "description": "This should fail"
    }
    
    headers = {"Authorization": f"Bearer {student_token}"}
    
    response = requests.post(
        f"{BASE_URL}/events",
        json=event_data,
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 403:
        print(f"✅ Correctly rejected student event creation!")
    else:
        print(f"❌ Unexpected response!")

def test_upload_event_photo(admin_token, event_id):
    """Test uploading a photo to an event"""
    print(f"\n=== Testing Event Photo Upload (Admin) ===")
    
    if not admin_token or not event_id:
        print("❌ Missing admin token or event ID, skipping...")
        return
    
    # Create a simple test image
    test_image_path = Path(__file__).parent / "test_image.jpg"
    if not test_image_path.exists():
        # Create a minimal JPG file (1x1 pixel)
        print(f"Creating test image at {test_image_path}...")
        import base64
        jpg_base64 = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAARAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
        jpg_data = base64.b64decode(jpg_base64)
        test_image_path.write_bytes(jpg_data)
    
    with open(test_image_path, "rb") as img:
        files = {"photo": ("test_image.jpg", img, "image/jpeg")}
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.post(
            f"{BASE_URL}/events/{event_id}/photos",
            files=files,
            headers=headers
        )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print(f"✅ Event photo uploaded successfully!")
    else:
        print(f"❌ Event photo upload failed!")

def test_upload_gallery_photo(admin_token):
    """Test uploading a photo to gallery"""
    print(f"\n=== Testing Gallery Photo Upload (Admin) ===")
    
    if not admin_token:
        print("❌ No admin token provided, skipping...")
        return
    
    # Create a simple test image
    test_image_path = Path(__file__).parent / "test_image.jpg"
    if not test_image_path.exists():
        print(f"Creating test image at {test_image_path}...")
        import base64
        jpg_base64 = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAARAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
        jpg_data = base64.b64decode(jpg_base64)
        test_image_path.write_bytes(jpg_data)
    
    with open(test_image_path, "rb") as img:
        data = {
            "title": "Test Gallery Photo",
            "uploadedBy": "Admin"
        }
        files = [("images", ("test_image.jpg", img, "image/jpeg"))]
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.post(
            f"{BASE_URL}/gallery/uploads",
            data=data,
            files=files,
            headers=headers
        )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print(f"✅ Gallery photo uploaded successfully!")
    else:
        print(f"❌ Gallery photo upload failed!")

def test_get_events():
    """Test retrieving all events"""
    print(f"\n=== Testing Get Events (Public) ===")
    
    response = requests.get(f"{BASE_URL}/events")
    
    print(f"Status: {response.status_code}")
    print(f"Response text: {response.text}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"Number of events: {len(data)}")
            if data:
                print(f"First event: {data[0].get('title')}")
            print(f"✅ Successfully retrieved events!")
        except Exception as e:
            print(f"❌ Error parsing JSON: {e}")
    else:
        print(f"❌ Failed to retrieve events!")

def test_get_gallery():
    """Test retrieving all gallery items"""
    print(f"\n=== Testing Get Gallery (Public) ===")
    
    response = requests.get(f"{BASE_URL}/gallery")
    
    print(f"Status: {response.status_code}")
    print(f"Response text: {response.text}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"Number of gallery items: {len(data)}")
            if data:
                print(f"First item: {data[0].get('title')}")
            print(f"✅ Successfully retrieved gallery!")
        except Exception as e:
            print(f"❌ Error parsing JSON: {e}")
    else:
        print(f"❌ Failed to retrieve gallery!")

if __name__ == "__main__":
    print("=" * 60)
    print("ADMIN WORKFLOW TEST - Event & Gallery Upload")
    print("=" * 60)
    
    # Test health check first
    print("\n=== Testing Backend Health ===")
    try:
        response = requests.get("http://127.0.0.1:8000/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Backend not reachable: {e}")
        exit(1)
    
    # Test authentication
    admin_token, admin_user = test_admin_login()
    student_token = test_student_login()
    
    # Test public endpoints
    test_get_events()
    test_get_gallery()
    
    # Test event creation
    event_id = test_create_event(admin_token)
    
    # Test authorization
    test_student_cannot_create_event(student_token)
    
    # Test photo uploads
    test_upload_event_photo(admin_token, event_id)
    test_upload_gallery_photo(admin_token)
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
