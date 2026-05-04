from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import auth, projects, gallery, contact
from app.core.config import settings
import os
import bcrypt

# Fix for passlib/bcrypt compatibility issue
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (object,), {"__version__": bcrypt.__version__})

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://vanvasi-pragati-mandal-pipaliya.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files (Local fallback if needed, though we use Supabase Storage)
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
    return {"message": "NGO Website FastAPI (Supabase) is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
