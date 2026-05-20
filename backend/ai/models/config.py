import os
from pathlib import Path
from dotenv import load_dotenv

# 1. BASE_DIR을 현재 파일(config.py) 기준으로 수정합니다.
# config.py가 backend/src/config.py에 있다고 가정할 때
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# 2. .env 파일 경로를 backend 폴더 내부로 고정합니다.
env_path = BASE_DIR / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

class Config:
    # 3. 모델 경로 계산도 backend 기준이 되도록 수정
    _env_model_path = os.getenv("MODEL_PATH", "ai/weights/best.pt")
    MODEL_PATH = str(BASE_DIR / "backend" / _env_model_path)
    
    API_URL = os.getenv("CLOVA_API_URL")
    SECRET_KEY = os.getenv("CLOVA_SECRET_KEY")
    MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", 10485760))
    INTERNAL_TOKEN = os.getenv("INTERNAL_TOKEN")
    DATABASE_URL = os.getenv("DATABASE_URL")

    @classmethod
    def validate_config(cls):
        # 4. 필수 변수 체크
        if not all([cls.API_URL, cls.SECRET_KEY, cls.DATABASE_URL, cls.INTERNAL_TOKEN]):
            raise ValueError(
                f"치명적 오류: .env 파일에서 필수 환경 변수가 누락되었습니다. "
                f"(확인 경로: {env_path})"
            )
        
        # 5. 모델 경로 존재 여부 체크
        if not os.path.exists(cls.MODEL_PATH):
            raise FileNotFoundError(f"모델 파일을 찾을 수 없습니다: {cls.MODEL_PATH}")