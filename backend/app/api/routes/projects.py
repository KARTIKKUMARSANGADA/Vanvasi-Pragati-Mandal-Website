from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.api import deps
from app.schemas import project as project_schemas
from app.services import project_service
from app.db import models

router = APIRouter()

@router.get("/", response_model=List[project_schemas.Project])
def read_projects(
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 100,
    category: Optional[str] = Query(None)
):
    projects = project_service.get_projects(db, skip=skip, limit=limit)
    if category:
        projects = [p for p in projects if p.category == category]
    return projects

@router.get("/{id}", response_model=project_schemas.Project)
def read_project(id: int, db: Session = Depends(get_db)):
    project = project_service.get_project(db, project_id=id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/", response_model=project_schemas.Project)
async def create_project(
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    full_description: str = Form(...),
    location: str = Form(...),
    date: str = Form(...),
    impact_points: List[str] = Form(default=[]),
    gallery_urls: List[str] = Form(default=[]),
    gallery_new_indices: List[int] = Form(default=[]),
    images: List[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(deps.get_current_admin)
):
    project_in = {
        "title": title,
        "category": category,
        "description": description,
        "full_description": full_description,
        "location": location,
        "date": date,
        "impact_points": impact_points
    }
    return await project_service.create_project(db, project_in, images, gallery_urls, gallery_new_indices)

@router.put("/{id}", response_model=project_schemas.Project)
async def update_project(
    id: int,
    title: str = Form(None),
    category: str = Form(None),
    description: str = Form(None),
    full_description: str = Form(None),
    location: str = Form(None),
    date: str = Form(None),
    impact_points: List[str] = Form(default=[]),
    deleted_images: List[str] = Form(default=[]),
    gallery_urls: List[str] = Form(default=[]),
    gallery_new_indices: List[int] = Form(default=[]),
    images: List[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(deps.get_current_admin)
):
    project_in = {
        "title": title,
        "category": category,
        "description": description,
        "full_description": full_description,
        "location": location,
        "date": date,
        "impact_points": impact_points if impact_points else None
    }
    updated_project = await project_service.update_project(db, id, project_in, images, deleted_images, gallery_urls, gallery_new_indices)
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated_project

@router.delete("/{id}")
def delete_project(
    id: int, 
    delete_gallery_images: bool = Query(False),
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(deps.get_current_admin)
):
    if not project_service.delete_project(db, id, delete_gallery_images):
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}
