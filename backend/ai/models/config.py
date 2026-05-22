# //backend/ai/modesl/config.py

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

class Config:
    BASE_DIR = BASE_DIR
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    _env_model_path = os.getenv("MODEL_PATH", "ai/weights/best.pt")
    MODEL_PATH = str(BASE_DIR / _env_model_path)
    
    API_URL = os.getenv("CLOVA_API_URL")
    SECRET_KEY = os.getenv("CLOVA_SECRET_KEY")
    MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", 10485760))
    INTERNAL_TOKEN = os.getenv("INTERNAL_TOKEN")

    @classmethod
    def validate_config(cls):
        if not all([cls.API_URL, cls.SECRET_KEY, cls.DATABASE_URL, cls.INTERNAL_TOKEN]):
            raise ValueError(f"필수 환경 변수 누락 (확인 경로: {env_path})")
        
        if not os.path.exists(cls.MODEL_PATH):
            raise FileNotFoundError(f"모델 파일 없음: {cls.MODEL_PATH}")