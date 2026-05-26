# //backend/ai/models/pipeline.py
import asyncio
import contextlib
import httpx
import logging
from anyio import to_thread
from backend.ai.models.ocr_service import OcrService

logger = logging.getLogger("pipeline_worker")

async def post_callback(callback_url: str, payload: dict):
    timeout = httpx.Timeout(10.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(callback_url, json=payload)
        r.raise_for_status()

async def async_pipeline_processor(
    task_id: str,
    file_bytes: bytes,
    ocr_service: OcrService,
    lock: asyncio.Lock,
    callback_url: str | None = None,
    request_id: str | None = None,
    task_store: dict = None,
    user_profile: dict = None
):
    logger.info(f">>> [PIPELINE] 파이프라인 작업 시작: {task_id}")

    def update_local_status(status, result=None, error=None):
        if task_store and task_id in task_store:
            task_store[task_id].update({"status": status, "result": result, "error": error})

    try:
        update_local_status("PROCESSING")

        # 1. 이미지 전처리
        image = await to_thread.run_sync(ocr_service.preprocess_image_bytes, file_bytes)

        # 2. OCR 요청
        print(f">>> [PIPELINE] OCR 처리 시작...")
        try:
            if asyncio.iscoroutinefunction(ocr_service.request_full_image_ocr):
                ocr_fields = await asyncio.wait_for(ocr_service.request_full_image_ocr(image), timeout=30.0)
            else:
                ocr_fields = await asyncio.wait_for(
                    to_thread.run_sync(ocr_service.request_full_image_ocr, image), timeout=30.0
                )
            print(f">>> [PIPELINE] OCR 처리 완료, 결과 필드 수: {len(ocr_fields) if ocr_fields else 0}")
        except asyncio.TimeoutError:
            raise TimeoutError("OCR API 타임아웃")

        # 3. YOLO 추론
        try:
            async with lock:
                boxes = await asyncio.wait_for(
                    to_thread.run_sync(ocr_service.detect_boxes, image), timeout=60.0
                )
        except asyncio.TimeoutError:
            raise TimeoutError("AI 추론 타임아웃")
        
        # 4. 분석 및 DB 매핑
        analysis_result = {"is_suncare": False, "detected_ingredients": [], "message": "분석 실패"}
        
        if ocr_fields:
            full_ocr_text = " ".join([field.get("text", "") for field in ocr_fields if "text" in field])
            print(f">>> [PIPELINE] 추출된 텍스트 전체: {full_ocr_text}")
            
            raw_analysis = ocr_service.analyze_suncare_ingredients(full_ocr_text)
            print(f">>> [PIPELINE] 성분 매칭된 결과: {raw_analysis}")
            
            if raw_analysis.get("detected_ingredients"):
                analysis_result = ocr_service.enrich_analysis_with_db(raw_analysis)
                analysis_result["is_suncare"] = True
                analysis_result["message"] = "분석 완료"
            else:
                print(f">>> [PIPELINE] 경고: 매칭된 성분이 없습니다.")
        else:
            print(f">>> [PIPELINE] 경고: OCR 결과가 비어있습니다.")

        # 5. 호환성 평가
        compatibility = {}
        if analysis_result and analysis_result.get("is_suncare") and user_profile:
            if hasattr(ocr_service, 'evaluate_compatibility'):
                compatibility = ocr_service.evaluate_compatibility(analysis_result, user_profile)
        
        # 6. 최종 데이터 패키지
        final_result = {"ingredients": analysis_result, "compatibility": compatibility}

        # 7. 성공 상태 업데이트 및 콜백
        update_local_status("COMPLETED", result=final_result)
        logger.info(f">>> [PIPELINE] 작업 완료: {task_id}")
        
        if callback_url:
            with contextlib.suppress(Exception):
                await post_callback(callback_url, {"task_id": task_id, "status": "COMPLETED", "result": final_result})

    except Exception as e:
        logger.error(f">>> [PIPELINE] 파이프라인 에러: {str(e)}", exc_info=True)
        update_local_status("FAILED", error=str(e))
        if callback_url:
            with contextlib.suppress(Exception):
                await post_callback(callback_url, {"task_id": task_id, "status": "FAILED", "error": str(e)})