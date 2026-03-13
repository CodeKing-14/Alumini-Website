from typing import List
from pathlib import Path
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import GalleryItem as GalleryItemModel
from schemas import GalleryItem as GalleryItemSchema


router = APIRouter(tags=["gallery"])


@router.get("/gallery", response_model=List[GalleryItemSchema])
def list_gallery(db: Session = Depends(get_db)) -> List[GalleryItemSchema]:
    items = db.query(GalleryItemModel).order_by(GalleryItemModel.created_at.desc()).all()
    return [
        GalleryItemSchema(
            id=i.id,
            title=i.title,
            imageUrl=i.image_url,
            uploadedBy=i.uploaded_by,
            createdAt=i.created_at,
        )
        for i in items
    ]


@router.post("/gallery/uploads", response_model=GalleryItemSchema)
async def upload_gallery_item(
    title: str = Form(...),
    uploadedBy: str | None = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> GalleryItemSchema:
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")

    uploads_dir = Path(__file__).resolve().parent.parent / "static" / "gallery"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(image.filename).suffix or ".jpg"
    file_name = f"{uuid.uuid4().hex}{ext}"
    file_path = uploads_dir / file_name

    content = await image.read()
    file_path.write_bytes(content)

    # URL path that matches StaticFiles mount in main.py ("/static")
    image_url = f"/static/gallery/{file_name}"

    db_item = GalleryItemModel(
        title=title.strip(),
        image_url=image_url,
        uploaded_by=uploadedBy or None,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return GalleryItemSchema(
        id=db_item.id,
        title=db_item.title,
        imageUrl=db_item.image_url,
        uploadedBy=db_item.uploaded_by,
        createdAt=db_item.created_at,
    )

