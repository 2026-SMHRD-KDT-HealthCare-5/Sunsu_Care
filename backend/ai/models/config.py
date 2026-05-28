# backend/ai/models/config.py
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os

# 프로젝트 루트(tp) 경로
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
# .env 파일 위치 지정 (backend 폴더 내부)
ENV_FILE_PATH = BASE_DIR / "backend" / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str
    CLOVA_API_URL: str
    CLOVA_SECRET_KEY: str
    INTERNAL_TOKEN: str
    MAX_IMAGE_SIZE: int = Field(default=10485760)
    MODEL_PATH: str = Field(default="backend/ai/weights/best.pt")

    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH,
        extra='ignore'
    )

    # 클래스 메서드로 정의하여 인스턴스 생성 없이/혹은 인스턴스에서 안전하게 호출 가능하도록 수정
    @classmethod
    def validate_config(cls, settings_instance):
        required_vars = [
            settings_instance.DATABASE_URL, 
            settings_instance.CLOVA_API_URL, 
            settings_instance.CLOVA_SECRET_KEY, 
            settings_instance.INTERNAL_TOKEN
        ]
        if not all(required_vars):
            raise ValueError(f"필수 환경 변수가 누락되었습니다. 경로 확인: {ENV_FILE_PATH}")

@lru_cache()
def get_settings():
    return Settings()

Config = get_settings()