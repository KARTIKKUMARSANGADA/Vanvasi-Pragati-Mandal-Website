import logging
import uuid
from typing import Any, Dict, List, Optional, Set

from fastapi import UploadFile
from app.db.supabase import get_supabase
from app.core.image_handler import compress_image

supabase = get_supabase()
logger = logging.getLogger(__name__)

def sanitize_boolean(value: Any, default: Optional[bool] = False) -> Optional[bool]:
    """
    Sanitizes values to boolean.
    - converts [] / "" / "[]" / None -> default (usually False)
    - converts "true"/"1"/"yes" -> True
    - converts "false"/"0"/"no" -> False
    """
    if value is None:
        return default

    if isinstance(value, bool):
        return value

    if isinstance(value, (list, dict)):
        return default

    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in ("", "[]"):
            return default
        if normalized in {"true", "1", "yes", "on"}:
            return True
        if normalized in {"false", "0", "no", "off"}:
            return False

    if isinstance(value, (int, float)):
        return bool(value)

    return default


def _discover_boolean_fields(project: Optional[dict], incoming_data: Dict[str, Any]) -> Set[str]:
    discovered_fields = {
        key for key, value in (project or {}).items() if isinstance(value, bool)
    }
    discovered_fields.update(
        key
        for key in incoming_data
        if key.startswith(("is_", "has_", "show_", "allow_", "enable_"))
    )
    return discovered_fields


def sanitize_project_update_data(
    raw_data: Dict[str, Any], boolean_fields: Optional[Set[str]] = None
) -> Dict[str, Any]:
    sanitized_data: Dict[str, Any] = {}
    boolean_fields = boolean_fields or set()

    for key, value in raw_data.items():
        if value is None:
            continue

        # Force sanitize any field that looks like a boolean or is in boolean_fields
        if key in boolean_fields or key.startswith(("is_", "has_", "show_", "allow_", "enable_")):
            sanitized_data[key] = sanitize_boolean(value)
            continue

        if key == "impact_points":
            if value == "[]" or value == []:
                sanitized_data[key] = []
                continue

            if isinstance(value, list):
                sanitized_data[key] = [
                    point.strip()
                    for point in value
                    if isinstance(point, str) and point.strip()
                ]
                continue

        if isinstance(value, str):
            trimmed_value = value.strip()
            if trimmed_value == "" or trimmed_value == "[]":
                continue
            sanitized_data[key] = trimmed_value
            continue

        # If it's a list that shouldn't be here (and not impact_points), skip it
        if isinstance(value, list) and key != "impact_points":
            logger.warning("Skipping unexpected list value for field '%s': %r", key, value)
            continue

        sanitized_data[key] = value

    return sanitized_data

from functools import lru_cache

def get_projects(skip: int = 0, limit: int = 100):
    # Select only necessary fields for listing
    response = supabase.table("projects") \
        .select("id, uuid, title, category, description, location, date, main_image_url") \
        .order("created_at", desc=True) \
        .range(skip, skip + limit - 1) \
        .execute()
        
    projects = response.data
    return projects

@lru_cache(maxsize=32)
def get_project(project_uuid: str):
    response = supabase.table("projects") \
        .select("*, project_images(*)") \
        .eq("uuid", str(project_uuid)) \
        .single() \
        .execute()
        
    return response.data

async def create_project(project_in: dict, images: List[UploadFile] = None, gallery_new_indices: List[int] = None, main_image_index: int = None):
    # Insert project
    if "uuid" not in project_in:
        project_in["uuid"] = str(uuid.uuid4())
    
    project_response = supabase.table("projects").insert(project_in).execute()
    project = project_response.data[0]
    
    if images:
        for index, image in enumerate(images):
            # Upload to Supabase Storage
            # Compress image
            try:
                content = await compress_image(image)
                file_ext = "jpg" # Forced to jpg for compression
                file_name = f"projects/{project['id']}/{uuid.uuid4()}.{file_ext}"
            except Exception as e:
                logger.error(f"Compression failed, uploading original: {e}")
                content = await image.read()
                file_name = f"projects/{project['id']}/{uuid.uuid4()}.{file_ext}"

            storage_response = supabase.storage.from_("images").upload(file_name, content)
            
            if storage_response:
                image_url = supabase.storage.from_("images").get_public_url(file_name)
                is_gal = bool(gallery_new_indices and index in gallery_new_indices)
                is_main = bool(main_image_index == index or (main_image_index is None and index == 0))
                
                # Insert project image
                supabase.table("project_images").insert({
                    "uuid": str(uuid.uuid4()),
                    "image_url": image_url,
                    "project_id": project["id"],
                    "is_gallery": is_gal,
                    "is_main": is_main
                }).execute()
                
                if is_gal:
                    # Insert into gallery
                    supabase.table("gallery").insert({
                        "image_url": image_url,
                        "category": project["category"]
                    }).execute()
                    
    return get_project(project["uuid"])

async def update_project(project_uuid: str, project_in: dict, images: List[UploadFile] = None, deleted_images: List[str] = None, gallery_urls: List[str] = None, gallery_new_indices: List[int] = None, main_image_url: str = None, main_image_index: int = None):
    project = get_project(project_uuid)
    if not project:
        return None
    
    project_id = project['id']

    boolean_fields = _discover_boolean_fields(project, project_in)
    cleaned_data = sanitize_project_update_data(project_in, boolean_fields=boolean_fields)

    # 1. Update core project data
    if cleaned_data:
        logger.info("UPDATING PROJECT %s | sanitized_data=%r", project_id, cleaned_data)
        try:
            supabase.table("projects").update(cleaned_data).eq("id", project_id).execute()
        except Exception as e:
            logger.error("Failed to update projects table: %s", str(e))
            raise

    # 2. Handle deleted images
    if deleted_images:
        for url in deleted_images:
            logger.info("Deleting image: %s", url)
            supabase.table("project_images").delete().eq("project_id", project_id).eq("image_url", url).execute()
            supabase.table("gallery").delete().eq("image_url", url).execute()

    # 3. Handle is_main reset (If a new main is being designated)
    if main_image_url or main_image_index is not None:
        logger.info("Resetting is_main for project %s", project_id)
        supabase.table("project_images").update({"is_main": False}).eq("project_id", project_id).execute()

    # 4. Insert new images
    if images:
        for index, image in enumerate(images):
            # Compress image
            try:
                content = await compress_image(image)
                file_ext = "jpg" # Forced to jpg for compression
                file_name = f"projects/{project_id}/{uuid.uuid4()}.{file_ext}"
            except Exception as e:
                logger.error(f"Compression failed, uploading original: {e}")
                content = await image.read()
                file_name = f"projects/{project_id}/{uuid.uuid4()}.{file_ext}"
            
            supabase.storage.from_("images").upload(file_name, content)
            
            image_url = supabase.storage.from_("images").get_public_url(file_name)
            is_gal = bool(gallery_new_indices and index in gallery_new_indices)
            is_main = bool(main_image_index == index)
            
            logger.info("Inserting new image: %s (is_main=%s)", image_url, is_main)
            supabase.table("project_images").insert({
                "uuid": str(uuid.uuid4()),
                "image_url": image_url,
                "project_id": project_id,
                "is_gallery": is_gal,
                "is_main": is_main
            }).execute()
            
            if is_gal:
                cat = project_in.get("category") or project.get("category")
                supabase.table("gallery").insert({
                    "image_url": image_url,
                    "category": cat
                }).execute()

    # 5. Set existing image as main (If URL was provided)
    if main_image_url:
        logger.info("Setting existing image as main: %s", main_image_url)
        supabase.table("project_images").update({"is_main": True}).eq("project_id", project_id).eq("image_url", main_image_url).execute()

    # 6. Handle gallery status updates for existing images
    if gallery_urls is not None:
        # Fetch current images to compare
        current_images = supabase.table("project_images").select("*").eq("project_id", project_id).execute().data
        for img in current_images:
            was_gallery = img["is_gallery"]
            now_gallery = img["image_url"] in gallery_urls
            
            if was_gallery != now_gallery:
                update_payload = {"is_gallery": bool(now_gallery)}
                logger.info("Updating image %s gallery status to %r", img["image_url"], now_gallery)
                supabase.table("project_images").update(update_payload).eq("id", img["id"]).execute()
                
                if now_gallery:
                    supabase.table("gallery").insert({
                        "image_url": img["image_url"],
                        "category": project_in.get("category") or project.get("category")
                    }).execute()
                else:
                    supabase.table("gallery").delete().eq("image_url", img["image_url"]).execute()

    return get_project(project_uuid)

def delete_project(project_uuid: str):
    project = get_project(project_uuid)
    if not project:
        return False
    
    project_id = project['id']
    # Delete project images first
    supabase.table("project_images").delete().eq("project_id", project_id).execute()
    # Delete project
    response = supabase.table("projects").delete().eq("uuid", project_uuid).execute()
    return len(response.data) > 0
