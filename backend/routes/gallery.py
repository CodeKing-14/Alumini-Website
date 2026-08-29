from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
import base64

from database import get_db
from models import GalleryItem, GalleryImage, User
from schemas import GalleryResponse
from routes.auth import require_admin

router = APIRouter(tags=["gallery"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


@router.get("/gallery", response_model=List[GalleryResponse])
def get_gallery(db: Session = Depends(get_db)):
    return db.query(GalleryItem).order_by(GalleryItem.uploaded_at.desc()).all()


@router.post("/gallery/uploads", response_model=GalleryResponse, status_code=status.HTTP_201_CREATED)
async def upload_gallery_item(
    title: str = Form(...),
    uploadedBy: Optional[str] = Form(None),
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")

    real_files = [img for img in images if img is not None and img.filename]
    if not real_files:
        raise HTTPException(status_code=400, detail="At least one image is required")

    gallery_images: list[GalleryImage] = []

    for image in real_files:
        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"'{image.filename}' is not a supported image type (use JPEG, PNG, GIF, or WEBP)",
            )
        content = await image.read()
        b64 = base64.b64encode(content).decode("utf-8")
        mime = image.content_type or "image/jpeg"
        data_url = f"data:{mime};base64,{b64}"
        gallery_images.append(GalleryImage(image_data=data_url))

    # Create ONE gallery entry with ALL images grouped under it
    db_item = GalleryItem(
        title=title.strip(),
        uploaded_by=(uploadedBy or "").strip() or None,
        images=gallery_images,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return db_item


@router.delete("/gallery/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gallery_item(
    item_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    # No filesystem cleanup needed — images are in the DB
    db.delete(item)  # cascades to gallery_images rows
    db.commit()
    return None
