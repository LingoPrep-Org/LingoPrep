from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "LingoPrep API"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5433/lingoprep"
    JWT_SECRET_KEY: str = "lingoprep_super_secret_jwt_key_for_development_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    AI_PROVIDER: str = "local"
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    REDIS_URL: str = "redis://localhost:6379/0"
    OBJECT_STORAGE_ENDPOINT: str = "localhost:9000"
    OBJECT_STORAGE_ACCESS_KEY: str = "minioadmin"
    OBJECT_STORAGE_SECRET_KEY: str = "minioadmin"
    OBJECT_STORAGE_BUCKET: str = "lingoprep-uploads"
    OBJECT_STORAGE_SECURE: bool = False

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
