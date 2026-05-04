from app.db.supabase import get_supabase
from app.services.email_service import send_email_background

supabase = get_supabase()

def create_contact_message(contact_in: dict):
    response = supabase.table("contact_messages").insert(contact_in).execute()
    
    # Optionally send email
    send_email_background(
        contact_in.get("name"),
        contact_in.get("email"),
        contact_in.get("phone"),
        contact_in.get("message")
    )
    
    return response.data[0]

def get_messages(skip: int = 0, limit: int = 100):
    response = supabase.table("contact_messages").select("*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
    return response.data

def delete_message(message_id: int):
    response = supabase.table("contact_messages").delete().eq("id", message_id).execute()
    return len(response.data) > 0
