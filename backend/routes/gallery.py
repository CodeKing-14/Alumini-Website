from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from pathlib import Path
import uuid

from database import get_db
from models import GalleryItem
from schemas import GalleryResponse
from routes.auth import require_admin
from models import User

router = APIRouter(tags=["gallery"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}

@router.get("/gallery", response_model=List[GalleryResponse])
def get_gallery(db: Session = Depends(get_db)):
    return db.query(GalleryItem).order_by(GalleryItem.uploaded_at.desc()).all()

@router.post("/gallery/uploads", response_model=List[GalleryResponse], status_code=status.HTTP_201_CREATED)
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

    uploads_dir = Path(__file__).resolve().parent.parent / "static" / "gallery"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    multi = len(real_files) > 1
    created_items: list[GalleryItem] = []

    for index, image in enumerate(real_files, start=1):
        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"'{image.filename}' is not a supported image type (use JPEG, PNG, GIF, or WEBP)",
            )

        ext = Path(image.filename).suffix or ".jpg"
        file_name = f"{uuid.uuid4().hex}{ext}"
        file_path = uploads_dir / file_name

        content = await image.read()
        file_path.write_bytes(content)

        # URL path that matches StaticFiles mount
        image_url = f"/static/gallery/{file_name}"

        # When several photos share one upload, number them so titles stay unique/readable.
        item_title = f"{title.strip()} ({index}/{len(real_files)})" if multi else title.strip()

        db_item = GalleryItem(
            title=item_title,
            image_url=image_url,
            uploaded_by=(uploadedBy or "").strip() or None,
        )
        db.add(db_item)
        created_items.append(db_item)

    db.commit()
    for item in created_items:
        db.refresh(item)

    return created_items


@router.delete("/gallery/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gallery_item(
    item_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    # Best-effort cleanup of the stored file; DB row is removed regardless.
    if item.image_url:  # type: ignore
        relative = str(item.image_url).split("/static/")[-1]
        file_path = Path(__file__).resolve().parent.parent / "static" / relative
        if file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                pass

    db.delete(item)
    db.commit()
    return None
