# backend/src/db/connection.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from backend.ai.models.config import get_settings

# 1. 설정 로드
settings = get_settings()

# 2. 비동기 DB 엔진 생성 (DATABASE_URL은 반드시 mysql+asyncmy://... 형태여야 합니다)
engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=False,
    pool_size=10,
    max_overflow=20
)

# 3. 비동기 세션 팩토리 생성
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 4. FastAPI에서 DB 세션을 얻기 위한 의존성 함수
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session