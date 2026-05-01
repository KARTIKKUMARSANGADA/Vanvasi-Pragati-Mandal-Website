from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.api.routes import auth, projects, gallery, contact
from app.middleware.cors import setup_cors
from app.db.database import Base, engine
from app.db.session import SessionLocal
from app.db import models
from app.core.config import settings
from app.core import security
import os
import bcrypt

# Fix for passlib/bcrypt compatibility issue
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (object,), {"__version__": bcrypt.__version__})

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# Middleware
setup_cors(app)

# Static Files
UPLOAD_DIR = os.path.join(os.getcwd(), "app/uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(gallery.router, prefix="/api/gallery", tags=["Gallery"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])

@app.get("/")
def root():
    return {"message": "NGO Website API is running"}

@app.on_event("startup")
def seed_admin():
    db = SessionLocal()
    try:
        admin_exists = db.query(models.Admin).filter(models.Admin.username == settings.ADMIN_USERNAME).first()
        if not admin_exists:
            hashed_password = security.get_password_hash(settings.ADMIN_PASSWORD)
            admin = models.Admin(username=settings.ADMIN_USERNAME, password=hashed_password)
            db.add(admin)
            db.commit()
            print(f"Admin user {settings.ADMIN_USERNAME} created.")
    finally:
        db.close()
