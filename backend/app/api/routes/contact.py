from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api import deps
from app.services import contact_service
from app.schemas.contact import ContactCreate

router = APIRouter()

@router.post("/")
def create_contact(contact_in: ContactCreate):
    if contact_in.honeypot:
        raise HTTPException(status_code=400, detail="Spam detected")
        
    data = contact_in.model_dump()
    data.pop("honeypot", None)
    return contact_service.create_contact_message(data)

@router.get("/")
def read_contacts(
    skip: int = 0, 
    limit: int = 100,
    current_admin: dict = Depends(deps.get_current_admin)
):
    return contact_service.get_messages(skip=skip, limit=limit)

@router.get("/unread/count")
def read_unread_count(current_admin: dict = Depends(deps.get_current_admin)):
    count = contact_service.get_unread_count()
    return {"count": count}

@router.put("/{uuid}/read")
def mark_message_read(
    uuid: str,
    current_admin: dict = Depends(deps.get_current_admin)
):
    if not contact_service.mark_as_read(uuid):
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message marked as read"}

@router.delete("/{uuid}")
def delete_contact(
    uuid: str, 
    current_admin: dict = Depends(deps.get_current_admin)
):
    if not contact_service.delete_message(uuid):
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted successfully"}

