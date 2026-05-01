from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api import deps
from app.schemas import gallery as gallery_schemas
from app.services import gallery_service
from app.db import models

router = APIRouter()

@router.get("/", response_model=List[gallery_schemas.Gallery])
def read_gallery(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return gallery_service.get_gallery(db, skip=skip, limit=limit)

@router.post("/")
async def upload_gallery_images(
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(deps.get_current_admin)
):
    await gallery_service.upload_images(db, images)
    return {"message": "Images uploaded successfully"}

@router.delete("/{id}")
def delete_gallery_image(
    id: int, 
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(deps.get_current_admin)
):
    if not gallery_service.delete_image(db, id):
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted successfully"}
