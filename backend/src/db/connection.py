# backend/src/db/connection.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from backend.ai.models.config import get_settings
import pymysql
from urllib.parse import urlparse

# 1. 설정 로드
settings = get_settings()

# 2. 비동기 DB 엔진 생성 (비동기 통신을 위해 mysql+asyncmy 사용)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=10,        # 커넥션 풀 크기
    max_overflow=20      # 추가 연결 허용치
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

def get_db_connection():
    db_url = settings.DATABASE_URL.replace("mysql+asyncmy://", "mysql://")
    parsed = urlparse(db_url)

    conn = pymysql.connect(
        host=parsed.hostname,
        port=parsed.port or 3306,
        user=parsed.username,
        password=parsed.password,
        db=parsed.path.lstrip('/'),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    return conn