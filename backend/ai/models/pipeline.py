# backend/ai/models/pipeline.py
import asyncio
import contextlib
import httpx
import logging
from anyio import to_thread
from backend.ai.models.ocr_service import OcrService
from backend.ai.models.ingredient_matcher import Ingredient_Matcher

logger = logging.getLogger("pipeline_worker")

async def post_callback(callback_url: str, payload: dict):
    try:
        timeout = httpx.Timeout(10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.post(callback_url, json=payload)
            r.raise_for_status()
    except Exception as e:
        logger.error(f"[CALLBACK] 호출 실패: {callback_url}, 에러: {e}")

async def async_pipeline_processor(
    task_id: str,
    file_bytes: bytes,
    ocr_service: OcrService,
    matcher: Ingredient_Matcher,
    lock: asyncio.Lock,
    callback_url: str | None = None,
    request_id: str | None = None,
    task_store: dict = None,
    user_profile: dict = None
):
    ocr_fields = await to_thread.run_sync(ocr_service.get_text, file_bytes)

    logger.info(f">>> [PIPELINE] Task Start: {task_id}")

    def update_status(status, result=None, error=None):
        if task_store is not None and task_id in task_store:
            task_store[task_id].update({"status": status, "result": result, "error": error})

    try:
        update_status("PROCESSING")

        # 1. 이미지 전처리
        image = await to_thread.run_sync(ocr_service.preprocess_image_bytes, file_bytes)

        # 2. OCR 요청
        logger.info(">>> [PIPELINE] OCR Requesting...")
        ocr_fields = await asyncio.wait_for(
            to_thread.run_sync(ocr_service.request_full_image_ocr, image),
            timeout=30.0
        )

        # 3. YOLO 추론
        logger.info(">>> [PIPELINE] AI Inference Start...")
        async with lock:
            boxes = await asyncio.wait_for(
                to_thread.run_sync(ocr_service.detect_boxes, image),
                timeout=60.0
            )
        
        # 4. 분석 및 DB 매핑
        analysis_result = {"is_suncare": False, "detected_ingredients": [], "message": "분석 실패"}
        
        if ocr_fields:
            extracted_texts = [f.get("text", "") for f in ocr_fields if "text" in f]
            logger.info(f">>> [PIPELINE] Extracted {len(extracted_texts)} segments.")
            
            matched_ingredients = matcher.match_ingredients(extracted_texts)
            logger.info(f">>> [PIPELINE] Matched {len(matched_ingredients)} ingredients.")
            
            if matched_ingredients:
                analysis_result = {
                    "is_suncare": True,
                    "detected_ingredients": matched_ingredients,
                    "message": "분석 완료"
                }

        # 5. 호환성 평가
        compatibility = {}
        if analysis_result.get("is_suncare") and user_profile:
            if hasattr(ocr_service, 'evaluate_compatibility'):
                compatibility = await to_thread.run_sync(
                    ocr_service.evaluate_compatibility, analysis_result, user_profile
                )
        
        # 6. 최종 데이터 패키지
        final_result = {
            "ingredients": analysis_result,
            "compatibility": compatibility,
            "boxes": boxes,
            "request_id": request_id
        }

        # 7. 상태 업데이트 및 콜백 전송
        update_status("COMPLETED", result=final_result)
        logger.info(f">>> [PIPELINE] Task Completed: {task_id}")

        if callback_url:
            await post_callback(callback_url, {"task_id": task_id, "status": "COMPLETED", "result": final_result})

    except Exception as e:
        logger.error(f">>> [PIPELINE] Task Failed: {task_id}, Error: {str(e)}", exc_info=True)
        update_status("FAILED", error=str(e))
        if callback_url:
            await post_callback(callback_url, {"task_id": task_id, "status": "FAILED", "error": str(e)})