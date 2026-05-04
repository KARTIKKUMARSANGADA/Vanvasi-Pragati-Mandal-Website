from typing import List
from fastapi import UploadFile
from app.db.supabase import get_supabase
import uuid

supabase = get_supabase()

def get_gallery(skip: int = 0, limit: int = 100):
    response = supabase.table("gallery").select("*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
    return response.data

async def upload_images(images: List[UploadFile]):
    for image in images:
        file_ext = image.filename.split(".")[-1]
        file_name = f"gallery/{uuid.uuid4()}.{file_ext}"
        
        content = await image.read()
        supabase.storage.from_("images").upload(file_name, content)
        
        image_url = supabase.storage.from_("images").get_public_url(file_name)
        
        supabase.table("gallery").insert({
            "image_url": image_url
        }).execute()
    return True

def delete_image(image_id: int):
    response = supabase.table("gallery").delete().eq("id", image_id).execute()
    return len(response.data) > 0
