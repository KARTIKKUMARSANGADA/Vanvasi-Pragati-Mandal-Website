import re
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str
    honeypot: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str):
        # Allow numbers, optional + prefix, spaces, dashes, parentheses
        cleaned = re.sub(r"[\s\-()]", "", v)
        if not re.match(r"^\+?[0-9]{10,15}$", cleaned):
            raise ValueError("Phone number must contain between 10 and 15 digits.")
        return v

    @field_validator("honeypot")
    @classmethod
    def validate_honeypot(cls, v: Optional[str]):
        if v and len(v.strip()) > 0:
            raise ValueError("Spam detected.")
        return v

class ContactResponse(BaseModel):
    id: int
    uuid: str
    name: str
    email: EmailStr
    phone: str
    message: str
    is_read: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

