from app.db.supabase import get_supabase
from app.core.email_handler import send_contact_notification

supabase = get_supabase()

def create_contact_message(contact_in: dict):
    response = supabase.table("contact_messages").insert(contact_in).execute()
    
    # Send email notification
    if response.data:
        msg = response.data[0]
        send_contact_notification(
            name=msg.get("name", "N/A"),
            email=msg.get("email", "N/A"),
            phone=msg.get("phone", "N/A"),
            message=msg.get("message", "N/A")
        )
        
    return response.data[0]

def get_messages(skip: int = 0, limit: int = 100):
    response = supabase.table("contact_messages").select("*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
    return response.data

def delete_message(message_id: int):
    response = supabase.table("contact_messages").delete().eq("id", message_id).execute()
    return len(response.data) > 0
