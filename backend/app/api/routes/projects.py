from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from typing import List, Optional
from app.api import deps
from app.schemas import project as project_schemas
from app.services import project_service

router = APIRouter()

@router.get("/", response_model=List[project_schemas.Project])
def read_projects(
    skip: int = 0, 
    limit: int = 100,
    category: Optional[str] = Query(None)
):
    projects = project_service.get_projects(skip=skip, limit=limit)
    if category:
        projects = [p for p in projects if p.get("category") == category]
    return projects

@router.get("/{id}", response_model=project_schemas.Project)
def read_project(id: int):
    project = project_service.get_project(project_id=id)
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
    gallery_new_indices: List[int] = Form(default=[]),
    images: List[UploadFile] = File(None),
    current_admin: dict = Depends(deps.get_current_admin)
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
    return await project_service.create_project(project_in, images, gallery_new_indices)

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
    current_admin: dict = Depends(deps.get_current_admin)
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
    # Clean up None values
    project_in = {k: v for k, v in project_in.items() if v is not None}
    
    updated_project = await project_service.update_project(id, project_in, images, deleted_images, gallery_urls, gallery_new_indices)
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated_project

@router.delete("/{id}")
def delete_project(
    id: int, 
    current_admin: dict = Depends(deps.get_current_admin)
):
    if not project_service.delete_project(id):
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}
