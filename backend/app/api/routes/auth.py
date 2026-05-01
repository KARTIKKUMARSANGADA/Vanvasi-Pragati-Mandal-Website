from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core import security
from app.schemas.admin import AdminLogin, Token
from app.db import models

router = APIRouter()

@router.post("/login", response_model=Token)
def login(admin_in: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.username == admin_in.username).first()
    if not admin or not security.verify_password(admin_in.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token = security.create_access_token(subject=admin.username)
    return {"access_token": access_token, "token_type": "bearer"}
