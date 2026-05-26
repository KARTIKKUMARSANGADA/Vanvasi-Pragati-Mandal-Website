from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Form
from typing import List, Optional
from app.api import deps
from app.services import gallery_service

router = APIRouter()

@router.get("/")
def read_gallery(
    skip: int = 0, 
    limit: int = 100,
    category: Optional[str] = Query(None)
):
    return gallery_service.get_gallery(skip=skip, limit=limit, category=category)


@router.post("/")
async def upload_gallery_images(
    images: List[UploadFile] = File(...),
    category: Optional[str] = Form(None),
    current_admin: dict = Depends(deps.get_current_admin)
):
    from app.core.image_handler import validate_image_file
    for img in images:
        try:
            await validate_image_file(img)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    return await gallery_service.upload_images(images, category=category)

@router.delete("/{uuid}")
def delete_gallery_image(
    uuid: str, 
    current_admin: dict = Depends(deps.get_current_admin)
):
    if not gallery_service.delete_image(uuid):
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted successfully"}
