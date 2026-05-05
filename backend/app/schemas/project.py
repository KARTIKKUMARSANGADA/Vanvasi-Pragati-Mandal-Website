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

class Project(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: str
    created_at: datetime
    main_image_url: Optional[str] = None
    images: List[ProjectImageBase] = Field(default_factory=list)
