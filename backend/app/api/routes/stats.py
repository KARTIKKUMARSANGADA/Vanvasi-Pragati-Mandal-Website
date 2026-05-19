from fastapi import APIRouter, Depends
from app.api import deps
from app.services import stats_service

router = APIRouter()

@router.get("/")
def read_stats(current_admin: dict = Depends(deps.get_current_admin)):
    return stats_service.get_admin_stats()

@router.get("/public")
def read_public_stats():
    return stats_service.get_public_stats()
