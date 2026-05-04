from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api import deps
from app.services import contact_service
from app.schemas.contact import ContactCreate

router = APIRouter()

@router.post("/")
def create_contact(contact_in: ContactCreate):
    return contact_service.create_contact_message(contact_in.model_dump())

@router.get("/")
def read_contacts(
    skip: int = 0, 
    limit: int = 100,
    current_admin: dict = Depends(deps.get_current_admin)
):
    return contact_service.get_messages(skip=skip, limit=limit)

@router.delete("/{id}")
def delete_contact(
    id: int, 
    current_admin: dict = Depends(deps.get_current_admin)
):
    if not contact_service.delete_message(id):
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted successfully"}
