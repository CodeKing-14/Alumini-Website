from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    fullName: str
    email: EmailStr


class UserCreate(BaseModel):
    fullName: str
    email: EmailStr
    password: str = Field(max_length=72, description="Password (max 72 bytes UTF-8)")
    batchYear: Optional[int] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(max_length=72, description="Password (max 72 bytes UTF-8)")


class AlumniProfile(BaseModel):
    id: str
    fullName: str
    email: EmailStr
    phone: Optional[str] = None
    department: Optional[str] = None
    batchYear: Optional[int] = None
    currentCompany: Optional[str] = None
    jobTitle: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    photoUrl: Optional[str] = None

    class Config:
        from_attributes = True


class AlumniProfileUpdate(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    batchYear: Optional[int] = None
    currentCompany: Optional[str] = None
    jobTitle: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None


class PhotoUploadResponse(BaseModel):
    photoUrl: str


class RegisteredEvent(BaseModel):
    id: str
    title: str
    dateISO: str
    location: str
    status: Optional[str] = None


class EventPublic(BaseModel):
    id: int
    title: str
    date: str
    location: str
    eventType: str
    purpose: str
    image: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class MemberItem(BaseModel):
    id: int
    name: str
    batch: str
    role: str
    company: str
    location: str
    image: str


class GalleryItem(BaseModel):
    id: int
    title: str
    imageUrl: str
    uploadedBy: Optional[str] = None
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True

