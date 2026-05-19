from fastapi import APIRouter, HTTPException, status
from app.services import auth_service
from app.core import security
from app.schemas.admin import Token, AdminLogin

router = APIRouter()

@router.post("/login", response_model=Token)
def login(login_data: AdminLogin):
    admin = auth_service.authenticate_admin(login_data.username, login_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(subject=admin["username"])
    return {"access_token": access_token, "token_type": "bearer"}
