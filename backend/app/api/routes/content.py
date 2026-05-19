from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Any
from app.api import deps
from app.services import content_service
from app.db.supabase import get_supabase
from app.core.image_handler import compress_image
import uuid

router = APIRouter()

@router.get("/{key}")
def read_content(key: str):
    """
    Retrieve site content by key (public endpoint)
    """
    return content_service.get_content(key)

@router.put("/{key}")
def write_content(
    key: str, 
    value: Any, 
    current_admin: dict = Depends(deps.get_current_admin)
):
    """
    Update site content by key (admin-only authenticated endpoint)
    """
    try:
        return content_service.update_content(key, value)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_content_image(
    file: UploadFile = File(...),
    current_admin: dict = Depends(deps.get_current_admin)
):
    """
    Upload a site content image (e.g. team member avatar) to Supabase Storage and get the public URL.
    """
    try:
        supabase = get_supabase()
        # Compress image
        try:
            content = await compress_image(file)
            file_ext = "jpg" # Forced to jpg for compression
            file_name = f"content/{uuid.uuid4()}.{file_ext}"
        except Exception as e:
            file_ext = file.filename.split(".")[-1]
            file_name = f"content/{uuid.uuid4()}.{file_ext}"
            content = await file.read()
            
        supabase.storage.from_("images").upload(file_name, content)
        image_url = supabase.storage.from_("images").get_public_url(file_name)
        
        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
