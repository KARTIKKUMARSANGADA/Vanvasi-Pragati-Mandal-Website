import sys
import os
import io
import asyncio
import requests
from PIL import Image

# Add current directory to path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.supabase import get_supabase
from app.core.image_handler import compress_image_bytes

supabase = get_supabase()

def get_path_from_url(url: str, bucket_name: str = "images") -> str:
    """
    Extracts the storage path from a Supabase public URL.
    Example URL: https://xyz.supabase.co/storage/v1/object/public/images/projects/1/uuid.jpg
    Returns: projects/1/uuid.jpg
    """
    marker = f"/public/{bucket_name}/"
    if marker in url:
        return url.split(marker)[1]
    return None

async def compress_existing_images():
    print("Fetching image URLs from database...")
    
    # Get all project images
    project_images_resp = supabase.table("project_images").select("image_url").execute()
    gallery_images_resp = supabase.table("gallery").select("image_url").execute()
    
    urls = set()
    for row in project_images_resp.data:
        if row.get("image_url"):
            urls.add(row["image_url"])
    for row in gallery_images_resp.data:
        if row.get("image_url"):
            urls.add(row["image_url"])
            
    print(f"Found {len(urls)} unique image URLs.")
    
    bucket_name = "images"
    success_count = 0
    fail_count = 0
    
    for url in urls:
        path = get_path_from_url(url, bucket_name)
        if not path:
            print(f"Skipping invalid URL: {url}")
            continue
            
        print(f"Processing: {path}...", end=" ", flush=True)
        
        try:
            # Download image
            response = requests.get(url)
            if response.status_code != 200:
                print(f"Failed to download (Status: {response.status_code})")
                fail_count += 1
                continue
                
            original_size = len(response.content)
            
            # Compress image
            compressed_content = compress_image_bytes(response.content)
            compressed_size = len(compressed_content)
            
            if compressed_size >= original_size:
                print(f"Skipped (No size reduction: {original_size/1024:.1f}KB -> {compressed_size/1024:.1f}KB)")
                continue
            
            # Upload back (upsert)
            # Note: We use 'upsert': 'true' to overwrite the existing file
            supabase.storage.from_(bucket_name).upload(
                path, 
                compressed_content, 
                {"upsert": "true", "content-type": "image/jpeg"}
            )
            
            reduction = (original_size - compressed_size) / original_size * 100
            print(f"Done! {original_size/1024:.1f}KB -> {compressed_size/1024:.1f}KB (-{reduction:.1f}%)")
            success_count += 1
            
        except Exception as e:
            print(f"Error: {e}")
            fail_count += 1
            
    print("\n--- Summary ---")
    print(f"Successfully compressed: {success_count}")
    print(f"Failed: {fail_count}")
    print("Note: Some images might have been skipped if compression didn't result in a smaller size.")

if __name__ == "__main__":
    asyncio.run(compress_existing_images())
