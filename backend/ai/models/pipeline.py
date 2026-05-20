import asyncio
import contextlib
import httpx
import logging

from anyio import to_thread

from backend.ai.models.ocr_service import OcrService # 이것도 절대 경로로 변경

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
    task_store: dict = None
):
    def update_local_status(status, result=None, error=None):
        if task_store and task_id in task_store:
            task_store[task_id].update({"status": status, "result": result, "error": error})

    try:
        # 1. 상태 변경
        update_local_status("PROCESSING")

        # 2. 이미지 전처리
        try:
            image = await to_thread.run_sync(
                ocr_service.preprocess_image_bytes,
                file_bytes
            )
        except Exception as img_err:
            raise ValueError(f"이미지 전처리 실패: {str(img_err)}")

        # 3. OCR 요청 (중복 제거 및 30초 타임아웃 적용)
        try:
            async with asyncio.timeout(30.0):
                if asyncio.iscoroutinefunction(ocr_service.request_full_image_ocr):
                    ocr_fields = await ocr_service.request_full_image_ocr(image)
                else:
                    ocr_fields = await to_thread.run_sync(
                        ocr_service.request_full_image_ocr,
                        image
                    )
        except asyncio.TimeoutError:
            raise TimeoutError("OCR API 타임아웃")

        # 4. YOLO 추론 (60초 타임아웃 및 Lock 적용)
        try:
            async with asyncio.timeout(60.0):
                async with lock:
                    boxes = await to_thread.run_sync(
                        ocr_service.detect_boxes,
                        image
                    )
        except asyncio.TimeoutError:
            raise TimeoutError("AI 추론 타임아웃")
        
        # 5. 분석 및 결과 조합
        if not boxes or len(boxes) == 0:
            # YOLO 미검출 시 Fallback
            if ocr_fields:
                full_ocr_text = " ".join([
                    field.get("text", "")
                    for field in ocr_fields
                    if "text" in field
                ])
                analysis_result = ocr_service.analyze_suncare_ingredients(full_ocr_text)
            else:
                analysis_result = {
                    "is_suncare": False,
                    "suncare_type": "성분표 및 텍스트 미검출",
                    "tags": [],
                    "detected_ingredients": {
                        "physical": [],
                        "chemical": []
                    }
                }
        else:
            # 정상 워크플로우 (텍스트 - 박스 매칭)
            matched_lines = ocr_service.match_text_to_boxes(boxes, ocr_fields)
            target_text = matched_lines[0] if matched_lines else ""
            analysis_result = ocr_service.analyze_suncare_ingredients(target_text)

        # 6. 최종 Payload 구성
        final_payload = {
            "task_id": task_id,
            "request_id": request_id,
            "status": "COMPLETED",
            "result": analysis_result
        }

        # 7. DB 저장
        update_local_status("COMPLETED", result=analysis_result)

        # 8. Callback 전송
        if callback_url:
            with contextlib.suppress(Exception):
                await post_callback(callback_url, final_payload)

    except Exception as e:
            logger.error(f"[{task_id}] 파이프라인 에러: {str(e)}", exc_info=True)
            
            # 메모리 상태 업데이트 (에러 발생)
            update_local_status("FAILED", error=str(e))
            
            # 콜백 전송
            err_payload = {
                "task_id": task_id,
                "request_id": request_id,
                "status": "FAILED",
                "error": str(e)
            }
            
            if callback_url:
                with contextlib.suppress(Exception):
                    await post_callback(callback_url, err_payload)