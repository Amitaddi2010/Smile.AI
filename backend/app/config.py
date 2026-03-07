"""
SMILE-AI Backend Configuration
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "SMILE-AI"
    APP_VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smile_ai.db").replace(
        "postgres://", "postgresql://", 1
    )
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smile-ai-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*")
    
    # ML Model paths
    MODEL_PATH: str = os.path.join(os.path.dirname(__file__), "..", "ml", "model.pkl")
    SCALER_PATH: str = os.path.join(os.path.dirname(__file__), "..", "ml", "scaler.pkl")
    ENCODERS_PATH: str = os.path.join(os.path.dirname(__file__), "..", "ml", "label_encoders.pkl")
    METADATA_PATH: str = os.path.join(os.path.dirname(__file__), "..", "ml", "model_metadata.json")
    
    # AI - Groq LLM
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    class Config:
        env_file = ".env"


settings = Settings()
