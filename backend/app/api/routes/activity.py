from fastapi import APIRouter, Depends
from app.api import deps
from app.services import activity_service

from pydantic import BaseModel

class ActivityCreate(BaseModel):
    action: str
    details: str

router = APIRouter()

@router.get("/")
def read_activities(current_admin: dict = Depends(deps.get_current_admin)):
    return activity_service.get_recent_activities()

@router.post("/")
def create_activity(activity: ActivityCreate, current_admin: dict = Depends(deps.get_current_admin)):
    activity_service.log_activity(activity.action, activity.details)
    return {"message": "Activity logged"}

