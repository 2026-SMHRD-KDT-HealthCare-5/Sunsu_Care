import cv2
import requests
import uuid
import time
import json
import numpy as np
import os
from ultralytics import YOLO

# 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
ai_dir = os.path.dirname(current_dir)
backend_dir = os.path.dirname(ai_dir)

model_path = os.path.join(ai_dir, 'weights', 'best.pt')
img_path = os.path.join(backend_dir, 'data', 'box.jpg')
runs_path = os.path.join(ai_dir, 'runs')

# CLOVA OCR API 정보
API_URL = "https://hjtx8ks4c0.apigw.ntruss.com/custom/v1/52853/de7d1b721a1e0632b7cf04edf5032c8ecffa9f9a08492152b926f1a5a7e765d7/general"
SECRET_KEY = "THViU253aGxZS3ZSY3NYTWVjQmpneHdkR0JWRHdyZUo="

# 모델 로드 및 클래스 이름 일괄 변경
model = YOLO(model_path)
model.model.names = {i: 'SP' for i in range(len(model.model.names))}

# 이미지 로드
image = cv2.imread(img_path)
if image is None:
    print(f"이미지를 불러올 수 없습니다. 경로를 확인하세요: {img_path}")
    exit()

# 1. exist_ok=True 추가하여 predict 폴더명 고정
results = model.predict(source=image, conf=0.6, save=True, project=runs_path, name="predict", exist_ok=True)

# 2. 실제 저장된 디렉토리를 결과 객체에서 직접 가져옴
save_dir = results[0].save_dir if hasattr(results[0], 'save_dir') else os.path.join(runs_path, 'predict')
os.makedirs(save_dir, exist_ok=True)
txt_file_path = os.path.join(save_dir, 'ocr_results.txt')

print(f"OCR 작업을 시작합니다. 결과는 다음 경로에 저장됩니다: {txt_file_path}")

with open(txt_file_path, 'w', encoding='utf-8') as f:
    for result_idx, result in enumerate(results):
        boxes = result.boxes.xyxy.cpu().numpy()
        
        # 3. 박스 정렬 (위 -> 아래, 왼쪽 -> 오른쪽 순서로 처리하고 싶을 때 사용)
        # 픽셀 오차를 고려해 y1을 10픽셀 단위로 묶어서 정렬하면 줄바꿈 인식이 잘 됩니다.
        boxes = sorted(boxes, key=lambda b: (b[1] // 10, b[0]))
        
        for i, box in enumerate(boxes):
            x1, y1, x2, y2 = map(int, box)
            cropped_img = image[y1:y2, x1:x2]
            
            if cropped_img.size == 0:
                continue

            # 이미지 인코딩
            _, img_encoded = cv2.imencode('.jpg', cropped_img)
            img_bytes = img_encoded.tobytes()

            # API 요청 페이로드 설정
            request_json = {
                'images': [{'format': 'jpg', 'name': f'crop_{i}'}],
                'requestId': str(uuid.uuid4()),
                'version': 'V2',
                'timestamp': int(round(time.time() * 1000))
            }

            payload = {'message': json.dumps(request_json).encode('UTF-8')}
            files = [('file', (f'crop_{i}.jpg', img_bytes, 'image/jpeg'))]
            headers = {'X-OCR-SECRET': SECRET_KEY}

            try:
                # API 호출 (타임아웃 설정 유지)
                response = requests.post(API_URL, headers=headers, data=payload, files=files, timeout=10)
                
                if response.status_code == 200:
                    res_data = response.json()
                    detected_text = " ".join([
                        field.get('inferText', "")
                        for img in res_data.get('images', [])
                        for field in img.get('fields', [])
                    ]).strip() # 앞뒤 공백 제거
                    
                    output_line = f"Box {i}: {detected_text}"
                    print(f"[{i}번 박스 OCR 결과]: {detected_text}")
                    f.write(output_line + "\n")
                    
                else:
                    print(f"[{i}번 박스] OCR 에러: HTTP {response.status_code}")
                    f.write(f"Box {i}: OCR Error (HTTP {response.status_code})\n")

            except Exception as e:
                print(f"[{i}번 박스] 요청 중 오류 발생: {e}")
                f.write(f"Box {i}: Exception Error ({e})\n")

print(f"\n--- 모든 작업 완료. 결과 저장됨: {txt_file_path} ---")