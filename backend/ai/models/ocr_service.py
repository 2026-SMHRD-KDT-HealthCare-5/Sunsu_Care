# backend/ai/models/ocr_service.py
import requests
import json
import io
import re
import numpy as np
from PIL import Image
from rapidfuzz import fuzz
from backend.ai.models.config import Config
import pymysql
from urllib.parse import urlparse

class OcrService:
    def __init__(self):
        self.ingredient_dict = self._load_ingredients_from_db()
        # Config에 정의된 변수명(API_URL, SECRET_KEY)을 그대로 사용
        self.ocr_url = Config.API_URL 
        self.ocr_secret = Config.SECRET_KEY

    def _load_ingredients_from_db(self):
        db_url = Config.DATABASE_URL
        parsed = urlparse(db_url.replace("mysql+pymysql://", "http://"))
        conn = pymysql.connect(
            host=parsed.hostname,
            port=parsed.port or 3312,
            user=parsed.username,
            password=parsed.password,
            db=parsed.path.lstrip('/'),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        ingredient_dict = {}
        try:
            with conn.cursor() as cursor:
                sql = "SELECT ingre_name, ewg_grade, skin_warning FROM tb_ingredient"
                cursor.execute(sql)
                results = cursor.fetchall()
                for row in results:
                    ingredient_dict[row['ingre_name']] = {
                        'ewg': row['ewg_grade'],
                        'warning': row['skin_warning']
                    }
        finally:
            conn.close()
        return ingredient_dict

    def preprocess_image_bytes(self, image_bytes: bytes):
        image = Image.open(io.BytesIO(image_bytes))
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        return np.array(image)

    def request_full_image_ocr(self, image_np: np.ndarray):
        print(">>> [OCR_SERVICE] 네이버 OCR API 호출 시작") # 무조건 찍힘
        img = Image.fromarray(image_np)
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG")
        image_bytes = buffer.getvalue()

        data = {
            "version": "V2",
            "requestId": "unique_id_123",
            "timestamp": 0,
            "images": [{"format": "jpg", "name": "demo"}]
        }
        
        files = {"file": image_bytes}
        headers = {"X-OCR-SECRET": self.ocr_secret}
        
        response = requests.post(self.ocr_url, headers=headers, data={"message": json.dumps(data)}, files=files)
        
        if response.status_code != 200:
            print(f">>> [OCR_SERVICE] 에러 발생! 상태코드: {response.status_code}, 내용: {response.text}")
            return []

        result = response.json()
        text_fields = []
        for image in result.get("images", []):
            for field in image.get("fields", []):
                text = field.get("inferText") or ""
                if text:
                    text_fields.append({"text": text})
        
        print(f">>> [OCR_SERVICE] 텍스트 추출 완료: {len(text_fields)}개 필드")
        return text_fields

    def analyze_suncare_ingredients(self, raw_text: str) -> dict:
        if not raw_text or not raw_text.strip():
            return {"is_suncare": False, "detected_ingredients": []}

        raw_text = re.sub(r'[\d\.]', '', raw_text) 
        raw_tokens = re.split(r'[,.\n\s]+', raw_text)
        ingredients_list = [t.strip() for t in raw_tokens if len(t.strip()) > 1]

        detected = []
        for ing in ingredients_list:
            for master_name in self.ingredient_dict.keys():
                if len(master_name) < 2: continue
                score = fuzz.partial_ratio(master_name, ing)
                if master_name in ing or score >= 85: 
                    if {"name": master_name} not in detected:
                        detected.append({"name": master_name})
                        print(f"DEBUG: 성분 매칭 성공! ({ing} -> {master_name}, 점수: {score})")
                    break

        return {"is_suncare": len(detected) > 0, "detected_ingredients": detected}

    def enrich_analysis_with_db(self, raw_analysis: dict) -> dict:
        enriched_ingredients = []
        for item in raw_analysis.get("detected_ingredients", []):
            db_info = self.ingredient_dict.get(item["name"])
            enriched_ingredients.append({
                "name": item["name"],
                "ewg": db_info['ewg'] if db_info else "알 수 없음",
                "warning": db_info['warning'] if db_info else "없음"
            })
        return {
            "is_suncare": raw_analysis.get("is_suncare", False),
            "detected_ingredients": enriched_ingredients,
            "message": "분석 완료"
        }

    def detect_boxes(self, image_np: np.ndarray):
        return [{"box": [0, 0, 1000, 1000]}]

    def evaluate_compatibility(self, analysis_result, user_profile):
        return {"score": 85, "message": "사용자 피부에 적합합니다."}