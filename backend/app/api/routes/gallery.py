from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from typing import List
from app.api import deps
from app.services import gallery_service

router = APIRouter()

@router.get("/")
def read_gallery(
    skip: int = 0, 
    limit: int = 100
):
    return gallery_service.get_gallery(skip=skip, limit=limit)

@router.post("/")
async def upload_gallery_images(
    images: List[UploadFile] = File(...),
    current_admin: dict = Depends(deps.get_current_admin)
):
    return await gallery_service.upload_images(images)

@router.delete("/{id}")
def delete_gallery_image(
    id: int, 
    current_admin: dict = Depends(deps.get_current_admin)
):
    if not gallery_service.delete_image(id):
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted successfully"}
