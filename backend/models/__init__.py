from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(String(100), nullable=False) 
    location = Column(String(255), nullable=False)


class GalleryItem(Base):
    __tablename__ = "gallery"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    image_url = Column(String(500), nullable=False)
    title = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
