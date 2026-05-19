from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GalleryBase(BaseModel):
    image_url: str
    category: Optional[str] = None

class GalleryCreate(GalleryBase):
    pass

class Gallery(GalleryBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
