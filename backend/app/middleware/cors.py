from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

def setup_cors(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # In production, restrict to frontend domain
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
