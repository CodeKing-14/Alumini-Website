from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="student", server_default="student")

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
    event_type = Column(String(20), nullable=False, default="Offline", server_default="Offline")
    image_url = Column(String(500), nullable=True)  # cover image (first uploaded), kept for backward compatibility

    images = relationship(
        "EventImage",
        back_populates="event",
        cascade="all, delete-orphan",
        order_by="EventImage.id",
    )

    @property
    def image_urls(self) -> list:
        """Flat list of every uploaded image URL for this event, cover included."""
        return [img.image_url for img in self.images]


class EventImage(Base):
    __tablename__ = "event_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)

    event = relationship("Event", back_populates="images")


class GalleryItem(Base):
    __tablename__ = "gallery"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    image_url = Column(String(500), nullable=False)
    title = Column(String(255), nullable=False)
    uploaded_by = Column(String(255), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
