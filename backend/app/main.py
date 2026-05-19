from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import auth, projects, gallery, contact, stats, activity, content, subscribers
from app.core.config import settings
import os
import bcrypt

# Fix for passlib/bcrypt compatibility issue
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (object,), {"__version__": bcrypt.__version__})

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Setup
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://vanvasi.org",
]
frontend_url_env = os.getenv("FRONTEND_URL")
if frontend_url_env:
    # Support comma-separated lists and strictly strip trailing slashes (which cause CORS preflight mismatch)
    parsed_origins = [url.strip().rstrip("/") for url in frontend_url_env.split(",") if url.strip()]
    for origin in parsed_origins:
        if origin not in allowed_origins:
            allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.middleware.rate_limit import RateLimitMiddleware
app.add_middleware(RateLimitMiddleware, limit=20, window=60)

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
app.include_router(stats.router, prefix="/api/stats", tags=["Stats"])
app.include_router(activity.router, prefix="/api/activity", tags=["Activity"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(subscribers.router, prefix="/api/subscribers", tags=["Subscribers"])

@app.get("/")
def root():
    return {"message": "NGO Website FastAPI (Supabase) is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
