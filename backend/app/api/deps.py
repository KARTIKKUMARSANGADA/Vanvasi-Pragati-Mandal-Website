from typing import Generator
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from app.core.config import settings
from app.db.supabase import get_supabase
from app.schemas.admin import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

def get_current_admin(
    request: Request
) -> dict:
    # 1. Try to read from secure cookie
    token = request.cookies.get("admin_token")
    
    # 2. Fallback to standard Bearer authorization header if cookie is missing (Swagger / Script compatible)
    if not token:
        authorization: str = request.headers.get("Authorization")
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Secure session token missing.",
        )
        
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    supabase = get_supabase()
    admin = supabase.table("admins").select("*").eq("username", token_data.sub).execute()
    
    if not admin.data:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    return admin.data[0]
