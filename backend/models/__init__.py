from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # Nullable for OAuth accounts
    role = Column(String(20), nullable=False, default="student", server_default="student")
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    auth_provider = Column(String(50), nullable=False, default="local", server_default="local")

    # Extended profile fields
    phone = Column(String(20), nullable=True)
    department = Column(String(100), nullable=True)
    batch_year = Column(Integer, nullable=True)
    current_company = Column(String(255), nullable=True)
    job_title = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(String(100), nullable=False) 
    location = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    event_type = Column(String(20), nullable=False, default="Offline", server_default="Offline")
    image_url = Column(String(500), nullable=True)  # kept for backward compatibility

    images = relationship(
        "EventImage",
        back_populates="event",
        cascade="all, delete-orphan",
        order_by="EventImage.id",
    )

    @property
    def image_urls(self) -> list:
        """Flat list of every uploaded image data-URL for this event."""
        return [img.image_data for img in self.images if img.image_data]


class EventImage(Base):
    __tablename__ = "event_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(500), nullable=True)  # legacy, kept for backward compat
    image_data = Column(Text(length=4294967295), nullable=True)  # base64 data URL (LONGTEXT in MySQL)

    event = relationship("Event", back_populates="images")


class GalleryItem(Base):
    __tablename__ = "gallery"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    image_url = Column(String(500), nullable=True)  # legacy, kept for backward compat
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    uploaded_by = Column(String(255), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Multiple images per gallery entry
    images = relationship(
        "GalleryImage",
        back_populates="gallery_item",
        cascade="all, delete-orphan",
        order_by="GalleryImage.id",
    )

    @property
    def image_data_list(self) -> list:
        """All base64 data URLs for this gallery entry."""
        return [img.image_data for img in self.images if img.image_data]

    @property
    def cover_image(self) -> str:
        """First image as cover, fallback to legacy image_url."""
        if self.images and self.images[0].image_data:
            return self.images[0].image_data
        return self.image_url or ""


class GalleryImage(Base):
    __tablename__ = "gallery_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    gallery_item_id = Column(Integer, ForeignKey("gallery.id", ondelete="CASCADE"), nullable=False, index=True)
    image_data = Column(Text(length=4294967295), nullable=False)  # base64 data URL (LONGTEXT in MySQL)

    gallery_item = relationship("GalleryItem", back_populates="images")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    job_type = Column(String(50), nullable=False, default="Full-time", server_default="Full-time")
    experience_level = Column(String(50), nullable=True)
    salary_range = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    application_email = Column(String(255), nullable=False, default="sritalumni@sritcbe", server_default="sritalumni@sritcbe")
    deadline = Column(String(100), nullable=True)
    posted_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class AdminOTP(Base):
    __tablename__ = "admin_otps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), nullable=False, index=True)
    otp_code = Column(String(10), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    is_used = Column(Boolean, default=False, nullable=False)
