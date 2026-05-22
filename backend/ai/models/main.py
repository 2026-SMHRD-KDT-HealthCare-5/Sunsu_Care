# //backend/ai/models/main.py

import uuid
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Form, Header, Depends
from anyio import to_thread
import asyncio
import json

# 1. 환경 설정 및 초기화
# .env 경로: backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=BASE_DIR / "backend" / ".env")

from backend.ai.models.config import Config
Config.validate_config()

from backend.ai.models.pipeline import async_pipeline_processor
from backend.ai.models.ocr_service import OcrService

# 2. 앱 및 서비스 초기화
app = FastAPI()
model_lock = asyncio.Lock()
ocr_service = OcrService()
task_store = {} 
INTERNAL_TOKEN = os.getenv("INTERNAL_TOKEN")

# 3. 인증 로직 (Depends용)
def verify_internal_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    
    token = authorization.split(" ")[1]
    if token != INTERNAL_TOKEN:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid internal token")

# 4. 엔드포인트
@app.post("/api/v1/suncare/analyze")
async def analyze(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_profile: str = Form(...), # ★ Node.js에서 보낸 JSON 문자열 받기
    callback_url: str | None = Form(default=None),
    request_id: str | None = Form(default=None),
    _auth: None = Depends(verify_internal_token)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")

    # 파일 크기 검증
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > Config.MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="업로드 가능한 최대 이미지 크기는 10MB입니다.")

    task_id = str(uuid.uuid4())
    file_bytes = await file.read()
    
    # JSON 문자열을 파이썬 딕셔너리로 변환
    profile_dict = json.loads(user_profile)

    task_store[task_id] = {
        "status": "PENDING",
        "request_id": request_id,
        "result": None
    }

    # 파이프라인 백그라운드 등록 (profile_dict 추가 전달)
    background_tasks.add_task(
        async_pipeline_processor,
        task_id,
        file_bytes,
        ocr_service,
        model_lock,
        callback_url,
        request_id,
        task_store,
        profile_dict
    )

    return {
        "status": "ACCEPTED",
        "task_id": task_id
    }

@app.get("/api/v1/tasks/{task_id}")
async def get_task(
    task_id: str,
    _auth: None = Depends(verify_internal_token)
):
    task = task_store.get(task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task