import os
import cv2
import config
from ocr_service import OcrService

def main():
    image = cv2.imread(config.IMG_PATH)
    if image is None:
        print(f"이미지를 불러올 수 없음. 다음 경로 확인: {config.IMG_PATH}")
        return
    
    ocr_service = OcrService(
        model_path=config.MODEL_PATH,
        api_url=config.API_URL,
        secret_key=config.SECRET_KEY
    )

    # 1. CLOVA OCR 전체 이미지 대상 1회만 호출
    print("1. CLOVA OCR 전체 이미지 분석 시작 (API 1회 호출)")
    try:
        ocr_fields = ocr_service.request_full_image_ocr(image)
        print(f"   - 분석 완료 (총 {len(ocr_fields)}개의 텍스트 블록 발견)")
    except Exception as e:
        print(f"   - OCR API 호출 중 오류 발생: {e}")
        return

    # 2. YOLO 객체 탐지 수행
    print("2. YOLO 객체 탐지 시작")
    boxes, save_dir = ocr_service.detect_boxes(image, config.RUNS_PATH)
    print(f"   - 탐지 완료 (총 {len(boxes)}개의 박스 발견)")

    # 3. 좌표 매칭 알고리즘 실행
    print("3. YOLO 박스와 OCR 텍스트 매칭 중...")
    matched_data = ocr_service.match_text_to_boxes(boxes, ocr_fields)

    # 4. 결과 저장
    txt_file_path = os.path.join(save_dir, 'ocr_results.txt')
    with open(txt_file_path, 'w', encoding='utf-8') as f:
        for i in range(len(boxes)):
            detected_text = matched_data.get(i, "").strip()
            output_line = f"Box {i}: {detected_text}\n"
            print(f"[{i}번 박스 매칭 결과]: {detected_text if detected_text else '(텍스트 없음)'}")
            f.write(output_line)

    print(f"\n--- 모든 작업 완료. 결과 저장됨: {txt_file_path} ---")

if __name__ == "__main__":
    main()