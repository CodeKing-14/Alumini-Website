from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import uuid

from database import get_db
from models import GalleryItem
from schemas import GalleryResponse

router = APIRouter(tags=["gallery"])

@router.get("/gallery", response_model=List[GalleryResponse])
def get_gallery(db: Session = Depends(get_db)):
    items = db.query(GalleryItem).all()
    return items

@router.post("/gallery/uploads", response_model=GalleryResponse)
async def upload_gallery_item(
    title: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")

    uploads_dir = Path(__file__).resolve().parent.parent / "static" / "gallery"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(image.filename).suffix or ".jpg"
    file_name = f"{uuid.uuid4().hex}{ext}"
    file_path = uploads_dir / file_name

    content = await image.read()
    file_path.write_bytes(content)

    # URL path that matches StaticFiles mount
    image_url = f"/static/gallery/{file_name}"

    db_item = GalleryItem(
        title=title.strip(),
        image_url=image_url
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return db_item
