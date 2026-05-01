from sqlalchemy.orm import Session
from app.db import models
from app.schemas import project as project_schemas
from typing import List, Optional
import os
import shutil
from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.getcwd(), "app/uploads")

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Project).offset(skip).limit(limit).all()

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

async def create_project(db: Session, project_in: dict, images: List[UploadFile] = None, gallery_urls: List[str] = None, gallery_new_indices: List[int] = None):
    db_project = models.Project(**project_in)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    if images:
        for index, image in enumerate(images):
            filename = f"{db_project.id}_{image.filename}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            image_url = f"/uploads/{filename}"
            is_gal = gallery_new_indices and index in gallery_new_indices
            
            # Add to project images
            db_image = models.ProjectImage(image_url=image_url, project_id=db_project.id, is_gallery=is_gal)
            db.add(db_image)
            
            if is_gal:
                # Add to gallery
                db_gallery = models.Gallery(image_url=image_url, category=db_project.category)
                db.add(db_gallery)
            
        db.commit()
        db.refresh(db_project)
        
    return db_project

async def update_project(db: Session, project_id: int, project_in: dict, images: List[UploadFile] = None, deleted_images: List[str] = None, gallery_urls: List[str] = None, gallery_new_indices: List[int] = None):
    db_project = get_project(db, project_id)
    if not db_project:
        return None
    
    for key, value in project_in.items():
        if value is not None:
            setattr(db_project, key, value)
            
    if db_project.images:
        for img in db_project.images:
            was_gallery = img.is_gallery
            img.is_gallery = gallery_urls and img.image_url in gallery_urls
            if img.is_gallery and not was_gallery:
                db_gallery = models.Gallery(image_url=img.image_url, category=db_project.category)
                db.add(db_gallery)
            elif not img.is_gallery and was_gallery:
                db.query(models.Gallery).filter(models.Gallery.image_url == img.image_url).delete(synchronize_session=False)
            
    if deleted_images:
        db.query(models.Gallery).filter(models.Gallery.image_url.in_(deleted_images)).delete(synchronize_session=False)
        for url in deleted_images:
            db.query(models.ProjectImage).filter(
                models.ProjectImage.project_id == project_id, 
                models.ProjectImage.image_url == url
            ).delete(synchronize_session=False)
    
    if images:
        for index, image in enumerate(images):
            filename = f"{db_project.id}_{image.filename}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            image_url = f"/uploads/{filename}"
            is_gal = gallery_new_indices and index in gallery_new_indices
            
            db_image = models.ProjectImage(image_url=image_url, project_id=db_project.id, is_gallery=is_gal)
            db.add(db_image)
            
            if is_gal:
                db_gallery = models.Gallery(image_url=image_url, category=db_project.category)
                db.add(db_gallery)
            
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int, delete_gallery_images: bool = False):
    db_project = get_project(db, project_id)
    if db_project:
        if delete_gallery_images:
            image_urls = [img.image_url for img in db_project.images]
            if image_urls:
                db.query(models.Gallery).filter(models.Gallery.image_url.in_(image_urls)).delete(synchronize_session=False)
        db.delete(db_project)
        db.commit()
        return True
    return False
