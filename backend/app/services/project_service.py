from typing import List, Optional
from fastapi import UploadFile
from app.db.supabase import get_supabase
import uuid

supabase = get_supabase()

def get_projects(skip: int = 0, limit: int = 100):
    response = supabase.table("projects").select("*, images:project_images(*)").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
    return response.data

def get_project(project_id: int):
    response = supabase.table("projects").select("*, images:project_images(*)").eq("id", project_id).execute()
    if response.data:
        return response.data[0]
    return None

async def create_project(project_in: dict, images: List[UploadFile] = None, gallery_new_indices: List[int] = None):
    # Insert project
    project_response = supabase.table("projects").insert(project_in).execute()
    project = project_response.data[0]
    
    if images:
        for index, image in enumerate(images):
            # Upload to Supabase Storage
            file_ext = image.filename.split(".")[-1]
            file_name = f"projects/{project['id']}/{uuid.uuid4()}.{file_ext}"
            
            content = await image.read()
            storage_response = supabase.storage.from_("images").upload(file_name, content)
            
            if storage_response:
                image_url = supabase.storage.from_("images").get_public_url(file_name)
                is_gal = gallery_new_indices and index in gallery_new_indices
                
                # Insert project image
                supabase.table("project_images").insert({
                    "image_url": image_url,
                    "project_id": project["id"],
                    "is_gallery": is_gal
                }).execute()
                
                if is_gal:
                    # Insert into gallery
                    supabase.table("gallery").insert({
                        "image_url": image_url,
                        "category": project["category"]
                    }).execute()
                    
    return get_project(project["id"])

async def update_project(project_id: int, project_in: dict, images: List[UploadFile] = None, deleted_images: List[str] = None, gallery_urls: List[str] = None, gallery_new_indices: List[int] = None):
    # Update project data
    supabase.table("projects").update(project_in).eq("id", project_id).execute()
    
    # Handle deleted images
    if deleted_images:
        for url in deleted_images:
            # Delete from project_images
            supabase.table("project_images").delete().eq("project_id", project_id).eq("image_url", url).execute()
            # Also delete from gallery if exists
            supabase.table("gallery").delete().eq("image_url", url).execute()
            
            # Note: Deleting from storage would require parsing the URL to get the file path
            # For simplicity, we'll just remove the references for now.
    
    # Handle new images
    if images:
        project = get_project(project_id)
        for index, image in enumerate(images):
            file_ext = image.filename.split(".")[-1]
            file_name = f"projects/{project_id}/{uuid.uuid4()}.{file_ext}"
            
            content = await image.read()
            supabase.storage.from_("images").upload(file_name, content)
            
            image_url = supabase.storage.from_("images").get_public_url(file_name)
            is_gal = gallery_new_indices and index in gallery_new_indices
            
            supabase.table("project_images").insert({
                "image_url": image_url,
                "project_id": project_id,
                "is_gallery": is_gal
            }).execute()
            
            if is_gal:
                supabase.table("gallery").insert({
                    "image_url": image_url,
                    "category": project["category"]
                }).execute()
                
    # Update gallery status for existing images
    if gallery_urls is not None:
        # This is more complex in Supabase, but we can do it
        current_images = supabase.table("project_images").select("*").eq("project_id", project_id).execute().data
        for img in current_images:
            was_gallery = img["is_gallery"]
            now_gallery = img["image_url"] in gallery_urls
            
            if was_gallery != now_gallery:
                supabase.table("project_images").update({"is_gallery": now_gallery}).eq("id", img["id"]).execute()
                if now_gallery:
                    # Add to gallery
                    supabase.table("gallery").insert({
                        "image_url": img["image_url"],
                        "category": project_in.get("category") or get_project(project_id)["category"]
                    }).execute()
                else:
                    # Remove from gallery
                    supabase.table("gallery").delete().eq("image_url", img["image_url"]).execute()

    return get_project(project_id)

def delete_project(project_id: int):
    # Supabase handles cascade if set up, otherwise we manually delete
    # Delete project images first if no cascade
    supabase.table("project_images").delete().eq("project_id", project_id).execute()
    # Delete project
    response = supabase.table("projects").delete().eq("id", project_id).execute()
    return len(response.data) > 0
