from app.db.supabase import get_supabase
from app.core.email_handler import send_contact_notification, send_contact_confirmation
from fastapi import BackgroundTasks
import uuid
import threading
import logging

logger = logging.getLogger(__name__)

supabase = get_supabase()

def _send_emails_background(msg: dict):
    """Send admin notification and user confirmation emails in a background thread."""
    try:
        send_contact_notification(
            name=msg.get("name", "N/A"),
            email=msg.get("email", "N/A"),
            phone=msg.get("phone", "N/A"),
            message=msg.get("message", "N/A")
        )
        if msg.get("email"):
            send_contact_confirmation(
                name=msg.get("name", "Supporter"),
                recipient_email=msg.get("email")
            )
    except Exception as e:
        logger.error(f"Background email send failed: {e}")

def create_contact_message(contact_in: dict, background_tasks: BackgroundTasks = None):
    if "uuid" not in contact_in:
        contact_in["uuid"] = str(uuid.uuid4())
    response = supabase.table("contact_messages").insert(contact_in).execute()
    
    # Send email notifications in background task if background_tasks is provided,
    # fallback to threading as a safe backup for scratch tests/seed scripts.
    if response.data:
        msg = response.data[0]
        if background_tasks:
            background_tasks.add_task(_send_emails_background, msg)
        else:
            thread = threading.Thread(target=_send_emails_background, args=(msg,), daemon=True)
            thread.start()
        
    return response.data[0]

def get_messages(skip: int = 0, limit: int = 100):
    response = supabase.table("contact_messages").select("*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
    return response.data

def delete_message(message_uuid: str):
    response = supabase.table("contact_messages").delete().eq("uuid", message_uuid).execute()
    return len(response.data) > 0

def mark_as_read(message_uuid: str):
    response = supabase.table("contact_messages").update({"is_read": True}).eq("uuid", message_uuid).execute()
    return len(response.data) > 0

def get_unread_count():
    response = supabase.table("contact_messages").select("id", count="exact").eq("is_read", False).execute()
    if hasattr(response, "count") and response.count is not None:
        return response.count
    return len(response.data) if response.data else 0


def mark_bulk_read(uuids: list):
    response = supabase.table("contact_messages").update({"is_read": True}).in_("uuid", uuids).execute()
    return len(response.data) > 0


def mark_bulk_unread(uuids: list):
    response = supabase.table("contact_messages").update({"is_read": False}).in_("uuid", uuids).execute()
    return len(response.data) > 0


def delete_bulk_messages(uuids: list):
    response = supabase.table("contact_messages").delete().in_("uuid", uuids).execute()
    return len(response.data) > 0


