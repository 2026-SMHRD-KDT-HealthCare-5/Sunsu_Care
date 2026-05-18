import cv2
import requests
import uuid
import time
import json
import numpy as np
from ultralytics import YOLO

class OcrService:
    def __init__(self, model_path, api_url, secret_key):
        self.model = YOLO(model_path)
        self.model.names = {i: 'Suncare_Product' for i in range(len(self.model.names))}
        self.api_url = api_url
        self.secret_key = secret_key

    def detect_boxes(self, image, project_path, conf=0.6):
        results = self.model.predict(
            source=image,
            conf=conf,
            save=True,
            project=project_path,
            name="predict",
            exist_ok=True
        )
        boxes = results[0].boxes.xyxy.cpu().numpy()
        # y축 기준 정렬 (상단 -> 하단)
        sorted_boxes = sorted(boxes, key=lambda b: (b[1] // 10, b[0]))
        save_dir = results[0].save_dir if hasattr(results[0], 'save_dir') else project_path
        return sorted_boxes, save_dir

    def request_full_image_ocr(self, image):
        """원본 이미지 전체를 CLOVA OCR에 딱 한 번만 보냅니다."""
        _, img_encoded = cv2.imencode('.jpg', image)
        img_bytes = img_encoded.tobytes()

        request_json = {
            'images': [{'format': 'jpg', 'name': 'full_image'}],
            'requestId': str(uuid.uuid4()),
            'version': 'V2',
            'timestamp': int(round(time.time() * 1000))
        }

        payload = {'message': json.dumps(request_json).encode('UTF-8')}
        files = [('file', ('full_image.jpg', img_bytes, 'image/jpeg'))]
        headers = {'X-OCR-SECRET': self.secret_key}

        response = requests.post(self.api_url, headers=headers, data=payload, files=files, timeout=15)

        if response.status_code == 200:
            res_data = response.json()
            ocr_fields = []
            
            # CLOVA가 반환한 모든 텍스트와 개별 좌표 추출
            for img in res_data.get('images', []):
                for field in img.get('fields', []):
                    text = field.get('inferText', '')
                    poly = field.get('boundingPoly', {}).get('vertices', [])
                    if len(poly) == 4:
                        # x, y의 최소/최대값으로 사각형(box) 좌표 변환
                        xs = [v.get('x', 0) for v in poly]
                        ys = [v.get('y', 0) for v in poly]
                        ocr_fields.append({
                            'text': text,
                            'box': [min(xs), min(ys), max(xs), max(ys)]
                        })
            return ocr_fields
        else:
            raise RuntimeError(f"CLOVA API HTTP {response.status_code}")

    @staticmethod
    def get_intersection_area(box1, box2):
        """두 박스가 겹치는 영역의 넓이를 구합니다."""
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        if x1 < x2 and y1 < y2:
            return (x2 - x1) * (y2 - y1)
        return 0

    def match_text_to_boxes(self, yolo_boxes, ocr_fields):
        """YOLO 박스 영역 안에 포함되는 OCR 텍스트들을 매칭합니다."""
        matched_results = {}

        for i, y_box in enumerate(yolo_boxes):
            box_texts = []
            y_area = (y_box[2] - y_box[0]) * (y_box[3] - y_box[1])
            
            for field in ocr_fields:
                o_box = field['box']
                inter_area = self.get_intersection_area(y_box, o_box)
                
                if inter_area > 0:
                    o_area = (o_box[2] - o_box[0]) * (o_box[3] - o_box[1])
                    # OCR 글자 박스가 YOLO 박스 내부에 50% 이상 겹치면 포함된 것으로 판정
                    if (inter_area / o_area) > 0.5:
                        box_texts.append(field)
            
            # YOLO 박스 내부에 들어온 글자들을 왼쪽->오른쪽 순서로 정렬 후 결합
            box_texts.sort(key=lambda x: x['box'][0])
            combined_text = " ".join([x['text'] for x in box_texts])
            matched_results[i] = combined_text
            
        return matched_results