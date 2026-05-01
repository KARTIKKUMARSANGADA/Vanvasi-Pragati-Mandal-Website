from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProjectImageBase(BaseModel):
    image_url: str
    is_gallery: bool = False
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    category: str
    description: str
    full_description: str
    location: str
    date: str
    impact_points: Optional[List[str]] = []

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    full_description: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    impact_points: Optional[List[str]] = None

class Project(ProjectBase):
    id: int
    created_at: datetime
    images: List[ProjectImageBase] = []
    class Config:
        from_attributes = True
