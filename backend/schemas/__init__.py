from datetime import datetime
from typing import Optional
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

    @property
    def name(self) -> str:
        return self.fullName


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ── Event Schemas ─────────────────────────────────────────────────────────────

class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    date: str
    location: str

    model_config = {"from_attributes": True}


# ── Gallery Schemas ───────────────────────────────────────────────────────────

class GalleryResponse(BaseModel):
    id: int
    image_url: str
    title: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}
