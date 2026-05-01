from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db import models
from app.schemas.contact import ContactCreate, ContactResponse
from app.api import deps
from app.services.email_service import send_email_background

router = APIRouter()

@router.post("/", response_model=ContactResponse)
def create_contact_message(contact: ContactCreate, db: Session = Depends(get_db)):
    # Save to database
    db_contact = models.ContactMessage(
        name=contact.name,
        email=contact.email,
        phone=contact.phone,
        message=contact.message
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)

    # Send email notification asynchronously
    send_email_background(
        name=contact.name,
        email=contact.email,
        phone=contact.phone,
        message=contact.message
    )

    return db_contact

@router.get("/", response_model=List[ContactResponse])
def get_contact_messages(db: Session = Depends(get_db), current_admin: models.Admin = Depends(deps.get_current_admin)):
    messages = db.query(models.ContactMessage).order_by(models.ContactMessage.created_at.desc()).all()
    return messages

@router.delete("/{message_id}")
def delete_contact_message(message_id: int, db: Session = Depends(get_db), current_admin: models.Admin = Depends(deps.get_current_admin)):
    db_message = db.query(models.ContactMessage).filter(models.ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    db.delete(db_message)
    db.commit()
    return {"message": "Contact message deleted successfully"}
