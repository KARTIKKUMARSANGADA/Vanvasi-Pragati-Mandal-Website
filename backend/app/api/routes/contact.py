from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List
from app.api import deps
from app.services import contact_service
from app.schemas.contact import ContactCreate

router = APIRouter()

@router.post("/")
def create_contact(contact_in: ContactCreate, background_tasks: BackgroundTasks):
    if contact_in.honeypot:
        raise HTTPException(status_code=400, detail="Spam detected")
        
    data = contact_in.model_dump()
    data.pop("honeypot", None)
    return contact_service.create_contact_message(data, background_tasks)

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


@router.post("/bulk/read")
def read_bulk_contacts(
    uuids: List[str],
    current_admin: dict = Depends(deps.get_current_admin)
):
    if not uuids:
        raise HTTPException(status_code=400, detail="No UUIDs provided")
    contact_service.mark_bulk_read(uuids)
    return {"message": f"Successfully marked {len(uuids)} messages as read"}


@router.post("/bulk/unread")
def unread_bulk_contacts(
    uuids: List[str],
    current_admin: dict = Depends(deps.get_current_admin)
):
    if not uuids:
        raise HTTPException(status_code=400, detail="No UUIDs provided")
    contact_service.mark_bulk_unread(uuids)
    return {"message": f"Successfully marked {len(uuids)} messages as unread"}


@router.post("/bulk/delete")
def delete_bulk_contacts(
    uuids: List[str],
    current_admin: dict = Depends(deps.get_current_admin)
):
    if not uuids:
        raise HTTPException(status_code=400, detail="No UUIDs provided")
    contact_service.delete_bulk_messages(uuids)
    return {"message": f"Successfully deleted {len(uuids)} messages"}


