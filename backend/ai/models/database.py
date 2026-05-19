import logging
from sqlalchemy import create_engine, Column, String, JSON, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.sql import func
from contextlib import contextmanager

logger = logging.getLogger("database")
Base = declarative_base()

class OCRTask(Base):
    __tablename__ = "ocr_tasks"
    
    task_id = Column(String(36), primary_key=True)
    request_id = Column(String(36), nullable=True, index=True) # Express가 보낸 상관키
    status = Column(String(20), nullable=False)  
    result = Column(JSON, nullable=True)         
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now()) # 상태 변경 시간 추적용

SessionLocal = None

def init_db(database_url: str):
    global SessionLocal
    if database_url.startswith("mysql://"):
        database_url = database_url.replace("mysql://", "mysql+pymysql://")

    engine = create_engine(
        database_url,
        pool_size=15,           
        max_overflow=25,       
        pool_recycle=1800,      
        pool_pre_ping=True,    
        echo=False
    )
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(
        autocommit=False, 
        autoflush=False, 
        expire_on_commit=False, 
        bind=engine
    )
    logger.info("MySQL Database Engine 초기화 완료.")

@contextmanager
def get_db_session():
    """트랜잭션 생명주기를 안전하게 관리하는 가벼운 컨텍스트 매니저"""
    if SessionLocal is None:
        raise RuntimeError("Database가 초기화되지 않았습니다.")
    
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"DB 트랜잭션 예외 발생: {str(e)}", exc_info=True)
        raise
    finally:
        db.close()

def update_task_status(task_id: str, status: str, result: dict = None, request_id: str = None):
    """
    작업 상태를 업데이트합니다. 
    동시성 문제와 데이터 유실을 방지하기 위해 DB에서 기존 객체를 조회 후 업데이트합니다.
    """
    with get_db_session() as db:
        task = db.query(OCRTask).filter(OCRTask.task_id == task_id).first()
        
        # 1. 새 작업인 경우 (PENDING 등 초기 진입점)
        if not task:
            task = OCRTask(task_id=task_id, status=status)
            db.add(task)
        # 2. 기존 작업 업데이트인 경우 상태 변경
        else:
            task.status = status

        # 값이 들어온 경우에만 업데이트 (기존 데이터 보존)
        if result is not None:
            task.result = result
        if request_id is not None:
            task.request_id = request_id

def get_task_status(task_id: str):
    with get_db_session() as db:
        task = db.query(OCRTask).filter(OCRTask.task_id == task_id).first()
        if task:
            return {
                "task_id": task.task_id,
                "request_id": task.request_id,
                "status": task.status, 
                "result": task.result,
                "updated_at": task.updated_at.isoformat() if task.updated_at else None
            }
        return None