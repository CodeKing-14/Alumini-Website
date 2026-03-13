from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    phone = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    batch_year = Column(Integer, nullable=True)
    current_company = Column(String(255), nullable=True)
    job_title = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    registrations = relationship("EventRegistration", back_populates="user")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date_text = Column(String(100), nullable=False)  # human-readable date as used by frontend
    location = Column(String(255), nullable=False)
    event_type = Column(String(50), nullable=False)  # Online / Offline
    purpose = Column(String(255), nullable=False)
    image = Column(String(500), nullable=False)

    registrations = relationship("EventRegistration", back_populates="event")


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    status = Column(
        Enum("registered", "attended", name="registration_status"),
        default="registered",
        nullable=False,
    )

    user = relationship("User", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")


class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=False)
    uploaded_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

