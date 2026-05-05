from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Body
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

@router.get("/{uuid}", response_model=project_schemas.Project)
def read_project(uuid: str):
    project = project_service.get_project(project_uuid=uuid)
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
    main_image_index: Optional[int] = Form(None),
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
    return await project_service.create_project(project_in, images, gallery_new_indices, main_image_index)

@router.put("/{uuid}", response_model=project_schemas.Project)
async def update_project(
    uuid: str,
    project_update: Optional[project_schemas.ProjectUpdate] = Body(None),
    title: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    full_description: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    impact_points: List[str] = Form(default=[]),
    deleted_images: List[str] = Form(default=[]),
    gallery_urls: List[str] = Form(default=[]),
    gallery_new_indices: List[int] = Form(default=[]),
    main_image_index: Optional[int] = Form(None),
    main_image_url: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
    current_admin: dict = Depends(deps.get_current_admin)
):
    # ✅ Handle JSON Body (from ProjectForm)
    if project_update and any(v is not None for v in project_update.model_dump().values()):
        project_in = project_update.model_dump(exclude_unset=True)
    else:
        # ✅ Handle Form Data (from ProjectModal)
        project_in = {
            "title": title,
            "category": category,
            "description": description,
            "full_description": full_description,
            "location": location,
            "date": date,
            "impact_points": impact_points if impact_points else []
        }
    
    # Clean up None values
    project_in = {k: v for k, v in project_in.items() if v is not None}
    
    try:
        updated_project = await project_service.update_project(
            project_uuid=uuid, 
            project_in=project_in, 
            images=images, 
            deleted_images=deleted_images, 
            gallery_urls=gallery_urls, 
            gallery_new_indices=gallery_new_indices, 
            main_image_url=main_image_url, 
            main_image_index=main_image_index
        )
        
        if not updated_project:
            raise HTTPException(status_code=404, detail="Project not found")
        return updated_project
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.delete("/{uuid}")
def delete_project(
    uuid: str, 
    current_admin: dict = Depends(deps.get_current_admin)
):
    if not project_service.delete_project(uuid):
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}
