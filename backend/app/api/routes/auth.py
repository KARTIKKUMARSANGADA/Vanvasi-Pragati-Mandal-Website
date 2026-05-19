from fastapi import APIRouter, HTTPException, status, Response
from app.services import auth_service
from app.core import security
from app.schemas.admin import Token, AdminLogin
from app.core.config import settings

router = APIRouter()

@router.post("/login", response_model=Token)
def login(login_data: AdminLogin, response: Response):
    admin = auth_service.authenticate_admin(login_data.username, login_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(subject=admin["username"])
    
    # Secure HTTP-Only session cookie
    response.set_cookie(
        key="admin_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=True
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="admin_token",
        httponly=True,
        samesite="lax",
        secure=True
    )
    return {"status": "success"}
