from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime

class ProjectImageBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uuid: str
    image_url: str
    is_gallery: bool = False
    is_main: bool = False

class ProjectBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str
    category: str
    description: str
    full_description: str
    location: str
    date: str
    impact_points: Optional[List[str]] = Field(default_factory=list)
    lat: Optional[float] = None
    lng: Optional[float] = None

class Project(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: str
    created_at: datetime
    main_image_url: Optional[str] = None
    images: List[ProjectImageBase] = Field(default_factory=list)

class ProjectUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    full_description: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    impact_points: Optional[List[str]] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

