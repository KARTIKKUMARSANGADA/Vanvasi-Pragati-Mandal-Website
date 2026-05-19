from app.db.supabase import get_supabase
import os
from dotenv import load_dotenv

# Load env manually
load_dotenv(".env")

supabase = get_supabase()

def check_is_read_column():
    try:
        response = supabase.table("contact_messages").update({"is_read": True}).eq("uuid", "d9b23f8a-8bab-4e79-b89a-bd3684edd29a").execute()
        print("Success! is_read column exists.")
    except Exception as e:
        print("Error checking is_read column:", e)

if __name__ == "__main__":
    check_is_read_column()
