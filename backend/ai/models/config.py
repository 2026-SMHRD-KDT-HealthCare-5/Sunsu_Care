import os
from pathlib import Path
from dotenv import load_dotenv

# 1. 경로 계산: 현재 파일에서 4번 올라가면 루트(TP 폴더)에 도달
# models -> ai -> backend -> TP
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

# 2. .env 파일 강제 로드 (루트의 .env를 타겟팅)
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

class Config:
    BASE_DIR = BASE_DIR
    
    # 데이터베이스 및 기타 설정
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # 모델 경로: 루트(BASE_DIR)로부터 상대 경로 계산
    _env_model_path = os.getenv("MODEL_PATH", "ai/weights/best.pt")
    MODEL_PATH = str(BASE_DIR / "backend" / _env_model_path)
    
    API_URL = os.getenv("CLOVA_API_URL")
    SECRET_KEY = os.getenv("CLOVA_SECRET_KEY")
    MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", 10485760))
    INTERNAL_TOKEN = os.getenv("INTERNAL_TOKEN")

    @classmethod
    def validate_config(cls):
        """환경 변수 및 필수 파일 검증"""
        # 하나라도 비어있으면 안 됨
        if not all([cls.API_URL, cls.SECRET_KEY, cls.DATABASE_URL, cls.INTERNAL_TOKEN]):
            raise ValueError(
                f"치명적 오류: .env 파일에서 필수 환경 변수가 누락되었습니다. "
                f"(확인 경로: {cls.BASE_DIR / '.env'})"
            )
        
        if not os.path.exists(cls.MODEL_PATH):
            raise FileNotFoundError(f"모델 파일을 찾을 수 없습니다: {cls.MODEL_PATH}")