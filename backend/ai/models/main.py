# backend/ai/models/main.py
import sys
import os
from pathlib import Path
import uuid
import json
import secrets
import asyncio
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Form, Header, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from contextlib import asynccontextmanager

# 1. 환경 설정 및 초기화
from backend.ai.models.config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Config 유효성 검사 (클래스 메서드 호출 방식 수정)
Config.validate_config(Config)

from backend.ai.models.ingredient_matcher import Ingredient_Matcher
from backend.ai.models.pipeline import async_pipeline_processor
from backend.ai.models.ocr_service import OcrService

# 2. 앱 및 서비스 초기화
app = FastAPI(title="Sunscare AI API")

ocr_service = OcrService()
matcher = Ingredient_Matcher()
model_lock = asyncio.Lock()
task_store = {}
INTERNAL_TOKEN = Config.INTERNAL_TOKEN

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# 3. 인증 로직
def verify_internal_token(authorization: str = Header(None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증 토큰이 누락되었습니다."
        )
    
    token = authorization.split(" ")[1]
    if not secrets.compare_digest(token, INTERNAL_TOKEN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="유효하지 않은 토큰입니다."
        )
    
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up AI Service: Loading DB Master Data...")
    try:
        await ocr_service.initialize()
        logger.info("AI Service Initialized Successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize OCR Service Data: {e}")
    yield
    logger.info("Shutting down AI Service...")

# 2. 앱 및 서비스 초기화 (lifespan 추가)
app = FastAPI(title="Sunscare AI API", lifespan=lifespan)

ocr_service = OcrService()
matcher = Ingredient_Matcher()
model_lock = asyncio.Lock()
task_store = {}
INTERNAL_TOKEN = Config.INTERNAL_TOKEN

# 4. 엔드포인트
@app.post("/api/v1/suncare/analyze", status_code=status.HTTP_202_ACCEPTED)
async def analyze(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_profile: str = Form(...),
    callback_url: str | None = Form(default=None),
    request_id: str | None = Form(default=None),
    _auth: None = Depends(verify_internal_token)
):
    # [검증 1] 파일 형식 체크
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 가능합니다.")

    # [핵심 수정] 파일을 딱 한 번만 읽습니다.
    file_bytes = await file.read()
    file_size = len(file_bytes)

    # [검증 2] 파일 크기 체크
    if file_size > Config.MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"파일이 너무 큽니다. (최대 {Config.MAX_IMAGE_SIZE // (1024*1024)}MB)"
        )
    
    # [검증 3] 프로필 데이터 파싱
    try:
        profile_dict = json.loads(user_profile)
    except (json.JSONDecodeError, ValidationError):
        raise HTTPException(status_code=400, detail="프로필 데이터가 유효하지 않습니다.")

    # 작업 생성
    task_id = str(uuid.uuid4())
    task_store[task_id] = {
        "status": "PENDING",
        "request_id": request_id,
        "result": None
    }

    logger.info(f"Task Created: {task_id} for Request: {request_id}")

    # 백그라운드 작업 등록 (위에서 미리 읽어둔 file_bytes를 그대로 넘깁니다)
    background_tasks.add_task(
        async_pipeline_processor,
        task_id,
        file_bytes,
        ocr_service,
        matcher,
        model_lock,
        callback_url,
        request_id,
        task_store,
        profile_dict
    )

    return {"status": "ACCEPTED", "task_id": task_id}

@app.get("/api/v1/tasks/{task_id}")
async def get_task(
    task_id: str,
    _auth: None = Depends(verify_internal_token)
):
    task = task_store.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="해당 작업을 찾을 수 없습니다.")
    return {"task_id": task_id, **task}

@app.get("/health")
async def health_check():
    return {"status": "ok"}