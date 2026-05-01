from sqlalchemy.orm import Session
from app.db import models
from typing import List
import os
import shutil
from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.getcwd(), "app/uploads")

def get_gallery(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Gallery).order_by(models.Gallery.created_at.desc()).offset(skip).limit(limit).all()

async def upload_images(db: Session, images: List[UploadFile]):
    for image in images:
        filename = f"gallery_{image.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        image_url = f"/uploads/{filename}"
        db_gallery = models.Gallery(image_url=image_url)
        db.add(db_gallery)
    
    db.commit()
    return True

def delete_image(db: Session, image_id: int):
    db_image = db.query(models.Gallery).filter(models.Gallery.id == image_id).first()
    if db_image:
        db.delete(db_image)
        db.commit()
        return True
    return False
