from app.db.supabase import get_supabase
import os
from dotenv import load_dotenv

# Load env manually since we are running as a script
load_dotenv(".env")

supabase = get_supabase()

def check_projects():
    print("Fetching projects...")
    response = supabase.table("projects").select("*").execute()
    print(f"Projects found: {len(response.data)}")
    for p in response.data:
        print(f"- {p.get('title')} (UUID: {p.get('uuid')})")

    print("\nFetching project_images...")
    img_res = supabase.table("project_images").select("*").execute()
    print(f"Images found: {len(img_res.data)}")

if __name__ == "__main__":
    check_projects()
