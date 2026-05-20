import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

class Config:
    # 디렉토리 경로 설정
    _env_model_path = os.getenv("MODEL_PATH", "ai/weights/best.pt")
    MODEL_PATH = str(BASE_DIR / _env_model_path)
    
    API_URL = os.getenv("CLOVA_API_URL")
    SECRET_KEY = os.getenv("CLOVA_SECRET_KEY")
    MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", 10485760))
    INTERNAL_TOKEN = os.getenv("INTERNAL_TOKEN")
    DATABASE_URL = os.getenv("DATABASE_URL")

    @classmethod
    def validate_config(cls):
        if not all([cls.API_URL, cls.SECRET_KEY, cls.DATABASE_URL, cls.INTERNAL_TOKEN]):
            raise ValueError(
                f"치명적 오류: .env 파일에서 필수 환경 변수가 누락되었습니다. "
                f"(확인 경로: {cls.BASE_DIR / '.env'})"
            )
        
        if not os.path.exists(cls.MODEL_PATH):
            raise FileNotFoundError(f"모델 파일을 찾을 수 없습니다: {cls.MODEL_PATH}")