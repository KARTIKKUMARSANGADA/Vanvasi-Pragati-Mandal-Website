from typing import List
from fastapi import UploadFile
from app.db.supabase import get_supabase
from app.core.image_handler import compress_image
import uuid

supabase = get_supabase()

def get_gallery(skip: int = 0, limit: int = 100):
    response = supabase.table("gallery").select("*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
    return response.data

async def upload_images(images: List[UploadFile]):
    for image in images:
        # Compress image
        try:
            content = await compress_image(image)
            file_ext = "jpg" # Forced to jpg for compression
            file_name = f"gallery/{uuid.uuid4()}.{file_ext}"
        except Exception as e:
            # Fallback if compression fails
            file_ext = image.filename.split(".")[-1]
            file_name = f"gallery/{uuid.uuid4()}.{file_ext}"
            content = await image.read()
        
        supabase.storage.from_("images").upload(file_name, content)
        
        image_url = supabase.storage.from_("images").get_public_url(file_name)
        
        supabase.table("gallery").insert({
            "uuid": str(uuid.uuid4()),
            "image_url": image_url
        }).execute()

    try:
        from app.services import activity_service
        activity_service.log_activity("Upload Gallery", f"Uploaded {len(images)} images to gallery")
    except Exception:
        pass

    return True

def delete_image(image_uuid: str):
    response = supabase.table("gallery").delete().eq("uuid", image_uuid).execute()
    if len(response.data) > 0:
        try:
            from app.services import activity_service
            activity_service.log_activity("Delete Gallery Image", f"Deleted gallery image")
        except Exception:
            pass
    return len(response.data) > 0
