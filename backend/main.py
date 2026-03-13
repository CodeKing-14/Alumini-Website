from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import auth, profile, events, members, gallery
from database import Base, engine
from database import SessionLocal
from models import User, Event, GalleryItem


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Alumni Website Backend")


# CORS so the React frontend can call this API during development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables on startup (simple development setup)
@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)

    # Seed minimal data for frontend to fetch (only if DB is empty)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            db.add_all(
                [
                    User(
                        full_name="Demo Alumni",
                        email="demo.alumni@example.com",
                        password_hash="not-used",
                        department="CSE",
                        batch_year=2024,
                        current_company="Demo Company",
                        job_title="Software Engineer",
                        location="Chennai",
                        bio="Demo alumni profile",
                        photo_url="https://i.pravatar.cc/150?img=12",
                    ),
                    User(
                        full_name="Sample Alumni",
                        email="sample.alumni@example.com",
                        password_hash="not-used",
                        department="ECE",
                        batch_year=2022,
                        current_company="Sample Corp",
                        job_title="Backend Developer",
                        location="Bengaluru",
                        bio="Sample alumni profile",
                        photo_url="https://i.pravatar.cc/150?img=32",
                    ),
                ]
            )

        if db.query(Event).count() == 0:
            db.add_all(
                [
                    Event(
                        title="Alumni Meetup 2026",
                        description="Annual alumni meetup for networking and memories.",
                        date_text="March 25, 2026",
                        location="SRIT Auditorium",
                        event_type="Offline",
                        purpose="Networking and reunion",
                        image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
                    ),
                    Event(
                        title="AI Tech Talk",
                        description="Talk on modern AI trends and career paths.",
                        date_text="April 10, 2026",
                        location="Online",
                        event_type="Online",
                        purpose="Knowledge sharing",
                        image="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
                    ),
                ]
            )

        if db.query(GalleryItem).count() == 0:
            db.add_all(
                [
                    GalleryItem(
                        title="Campus Memories",
                        image_url="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
                        uploaded_by="Admin",
                    ),
                    GalleryItem(
                        title="Alumni Gathering",
                        image_url="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
                        uploaded_by="Admin",
                    ),
                ]
            )

        db.commit()
    finally:
        db.close()


# Mount static files for uploaded images (profile photos, gallery)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
def health_check() -> dict:
    return {"status": "ok", "message": "Alumni backend is running"}


# Include API routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(members.router, prefix="/api")
app.include_router(gallery.router, prefix="/api")