from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vanvasi Pragati Mandal API"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30 # 30 days
    DATABASE_URL: Optional[str] = None
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # Admin Seeding
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    ADMIN_EMAIL: Optional[str] = None

    # Brevo Email API (Alternative to SMTP)
    BREVO_API_KEY: Optional[str] = None
    BREVO_FROM_EMAIL: str = "official.vanvasipragatimandal@gmail.com"

    @field_validator("ADMIN_USERNAME", "ADMIN_PASSWORD")
    @classmethod
    def check_not_empty(cls, v: str):
        if not v or v.strip() == "":
            raise ValueError("Admin credentials cannot be empty")
        return v

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
