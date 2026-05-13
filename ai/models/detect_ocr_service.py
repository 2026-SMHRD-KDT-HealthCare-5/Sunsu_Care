import cv2
import requests
import uuid
import time
import json
import numpy as np
import os
from ultralytics import YOLO

# 1. 설정 정보
API_URL = "https://hjtx8ks4c0.apigw.ntruss.com/custom/v1/52853/de7d1b721a1e0632b7cf04edf5032c8ecffa9f9a08492152b926f1a5a7e765d7/general"
SECRET_KEY = "THViU253aGxZS3ZSY3NYTWVjQmpneHdkR0JWRHdyZUo="

# [수정] 모델 경로: weights 폴더 안에 있는 best.pt 참조
# p1.py가 models 폴더 안에 있으므로 ../를 사용해 상위로 나간 뒤 weights로 들어갑니다.
model_path = os.path.join('..', 'weights', 'best.pt')
model = YOLO(model_path)

# 클래스 이름 강제 지정
model.model.names = {i: 'SP' for i in range(len(model.model.names))}

# 2. 이미지 로드 및 탐지
# [수정] 이미지 경로: data 폴더 안에 있는 box.jpg 참조
img_path = os.path.join('..', 'data', 'box.jpg')
image = cv2.imread(img_path)

if image is None:
    print(f"이미지를 불러올 수 없습니다: {img_path}")
    exit()

# [개선] 결과 저장 폴더를 지정 (runs/predict 대신 사용자가 원하는 곳에 저장 가능)
results = model.predict(source=image, conf=0.6, save=True, project="../runs", name="predict")

# 3. 탐지된 영역 크롭 및 OCR 전송
for result in results:
    boxes = result.boxes.xyxy.cpu().numpy()
    
    for i, box in enumerate(boxes):
        x1, y1, x2, y2 = map(int, box)
        cropped_img = image[y1:y2, x1:x2]
        
        if cropped_img.size == 0:
            continue

        # 파일을 디스크에 저장하지 않고 메모리에서 바로 인코딩
        _, img_encoded = cv2.imencode('.jpg', cropped_img)
        img_bytes = img_encoded.tobytes()

        # Naver CLOVA OCR 요청 데이터
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
            response = requests.post(API_URL, headers=headers, data=payload, files=files, timeout=10)
            
            if response.status_code == 200:
                res_data = response.json()
                detected_text = " ".join([
                    field.get('inferText', "") 
                    for img in res_data.get('images', []) 
                    for field in img.get('fields', [])
                ])
                
                print(f"[{i}번 박스 OCR 결과]: {detected_text}")
            else:
                print(f"[{i}번 박스] OCR 에러: HTTP {response.status_code}")

        except Exception as e:
            print(f"[{i}번 박스] 요청 중 오류 발생: {e}")

print("\n--- 모든 작업 완료 ---")