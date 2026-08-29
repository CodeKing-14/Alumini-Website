from datetime import datetime
from typing import Optional, Any, List
from pydantic import BaseModel, EmailStr, Field, field_validator


# ── User Schemas ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    """Used by POST /register.
    Frontend Login.tsx sends { fullName, email, password, batchYear }.
    We accept both 'name' and 'fullName' for flexibility.
    """
    fullName: str = Field(..., min_length=2, max_length=100, alias="fullName")
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)
    batchYear: Optional[int] = None

    model_config = {"populate_by_name": True}

    # Ensure numeric-only passwords (e.g. "123456") are accepted
    @field_validator("password", mode="before")
    @classmethod
    def coerce_password_to_str(cls, v: Any) -> str:
        return str(v)

    @property
    def name(self) -> str:
        return self.fullName


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str = "student"

    @field_validator("password", mode="before")
    @classmethod
    def coerce_password_to_str(cls, v: Any) -> str:
        return str(v)


# ── Profile Schemas ───────────────────────────────────────────────────────────

class AlumniProfileResponse(BaseModel):
    id: str
    fullName: str
    email: str
    phone: Optional[str] = None
    department: Optional[str] = None
    batchYear: Optional[int] = None
    currentCompany: Optional[str] = None
    jobTitle: Optional[str] = None
    bio: Optional[str] = None
    photoUrl: Optional[str] = None

    model_config = {"from_attributes": True}


class AlumniProfileUpdate(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    batchYear: Optional[int] = None
    currentCompany: Optional[str] = None
    jobTitle: Optional[str] = None
    bio: Optional[str] = None


# ── Event Schemas ─────────────────────────────────────────────────────────────
# Frontend (Events.tsx) reads camelCase keys (eventType, image); the ORM
# column names stay snake_case, so validation_alias bridges attribute -> field,
# and the plain field name is used again on the way out to JSON.

class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    date: str
    location: str
    eventType: str = Field(default="Offline", validation_alias="event_type")
    image: Optional[str] = Field(default=None, validation_alias="image_url")
    images: List[str] = Field(default_factory=list, validation_alias="image_urls")

    model_config = {"from_attributes": True, "populate_by_name": True}


class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    date: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=255)
    eventType: str = Field(default="Offline")


# ── Gallery Schemas ───────────────────────────────────────────────────────────
# Gallery entries can now have multiple images. The response includes:
# - imageUrl: first/cover image (for backward compat and grid thumbnails)
# - imageUrls: all images (for the popup slider)

class GalleryResponse(BaseModel):
    id: int
    title: str
    imageUrl: str = Field(validation_alias="cover_image")
    imageUrls: List[str] = Field(default_factory=list, validation_alias="image_data_list")
    uploadedBy: Optional[str] = Field(default=None, validation_alias="uploaded_by")
    createdAt: datetime = Field(validation_alias="uploaded_at")

    model_config = {"from_attributes": True, "populate_by_name": True}
