from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from app.api import deps
from app.db.supabase import get_supabase
import uuid

router = APIRouter()
supabase = get_supabase()

class SubscribeRequest(BaseModel):
    email: EmailStr

@router.post("/")
def subscribe(request: SubscribeRequest):
    """
    Public endpoint to subscribe to the newsletter
    """
    email_clean = request.email.strip().lower()
    
    # Check if subscriber already exists
    response = supabase.table("subscribers").select("*").eq("email", email_clean).execute()
    if response.data:
        # If already subscribed and active
        if response.data[0].get("is_active", True):
            return {"message": "You are already subscribed!"}
        else:
            # Re-activate subscriber
            supabase.table("subscribers").update({"is_active": True}).eq("email", email_clean).execute()
            return {"message": "Subscription re-activated successfully!"}
            
    # Insert new subscriber
    try:
        supabase.table("subscribers").insert({
            "uuid": str(uuid.uuid4()),
            "email": email_clean,
            "is_active": True
        }).execute()
        return {"message": "Subscribed successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_subscribers(
    current_admin: dict = Depends(deps.get_current_admin)
):
    """
    Get all active subscribers (Admin only)
    """
    response = supabase.table("subscribers").select("*").eq("is_active", True).execute()
    return response.data

@router.delete("/{email}")
def unsubscribe(
    email: str,
    current_admin: dict = Depends(deps.get_current_admin)
):
    """
    Remove or deactivate subscriber (Admin only)
    """
    email_clean = email.strip().lower()
    response = supabase.table("subscribers").delete().eq("email", email_clean).execute()
    return {"message": "Subscriber removed successfully!"}

class NotifyRequest(BaseModel):
    project_uuid: str

@router.post("/notify")
def notify_subscribers(
    request: NotifyRequest,
    current_admin: dict = Depends(deps.get_current_admin)
):
    """
    Send an email newsletter about a newly completed project to all active subscribers.
    """
    from app.core.email_handler import send_project_notification
    
    # 1. Fetch project details
    proj_response = supabase.table("projects").select("*").eq("uuid", request.project_uuid).execute()
    if not proj_response.data:
        raise HTTPException(status_code=404, detail="Project not found")
        
    project = proj_response.data[0]
    title = project.get("title", "New Project")
    description = project.get("description", "A new community project has been successfully completed.")
    category = project.get("category", "General")
    location = project.get("location", "Dahod, Gujarat")
    
    # 2. Fetch all active subscribers
    subs_response = supabase.table("subscribers").select("*").eq("is_active", True).execute()
    subscribers = subs_response.data
    
    if not subscribers:
        return {"message": "No active subscribers to notify.", "sent_count": 0}
        
    success_count = 0
    for sub in subscribers:
        email = sub.get("email")
        if email:
            if send_project_notification(email, title, description, category, location):
                success_count += 1
                
    return {
        "message": f"Successfully notified {success_count} of {len(subscribers)} subscribers!",
        "total_subscribers": len(subscribers),
        "sent_count": success_count
    }

class BroadcastRequest(BaseModel):
    subject: str
    body: str
    emails: Optional[List[str]] = None

@router.post("/broadcast")
def broadcast_custom_message(
    request: BroadcastRequest,
    background_tasks: BackgroundTasks,
    current_admin: dict = Depends(deps.get_current_admin)
):
    """
    Broadcast a custom email newsletter message to selected emails, or all active subscribers if list is empty/None.
    Emails are sent in a managed background task so the API returns instantly.
    """
    from app.core.email_handler import send_bulk_custom_email
    
    recipients = []
    if request.emails and len(request.emails) > 0:
        # Send to selected list
        recipients = [e.strip().lower() for e in request.emails if e.strip()]
    else:
        # Send to ALL active subscribers
        subs_response = supabase.table("subscribers").select("email").eq("is_active", True).execute()
        if subs_response.data:
            recipients = [sub.get("email") for sub in subs_response.data if sub.get("email")]
            
    if not recipients:
        return {"message": "No active recipients to email.", "sent_count": 0}
    
    # Send emails in background task (non-blocking, FastAPI thread-pooled)
    background_tasks.add_task(send_bulk_custom_email, recipients, request.subject, request.body)
        
    return {
        "message": f"Broadcast queued for {len(recipients)} recipients! Emails are being sent.",
        "total_recipients": len(recipients),
        "sent_count": len(recipients)
    }

