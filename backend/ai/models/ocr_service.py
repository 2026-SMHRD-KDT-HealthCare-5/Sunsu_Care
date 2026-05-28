# backend/ai/models/ocr_service.py
import io
import re
import json
import requests
import numpy as np
from PIL import Image
from rapidfuzz import fuzz, process
from backend.ai.models.config import get_settings
from backend.src.db.connection import get_db_connection

class OcrService:
    def __init__(self):
        self.settings = get_settings()
        self.ocr_url = self.settings.CLOVA_API_URL
        self.ocr_secret = self.settings.CLOVA_SECRET_KEY
        self.ingredient_dict = self._load_ingredients_from_db()
    
    def _load_ingredients_from_db(self):
        ingredient_dict = {}
        conn = get_db_connection()
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
            return []

        result = response.json()
        text_fields = []
        for image in result.get("images", []):
            for field in image.get("fields", []):
                text = field.get("inferText") or ""
                if text: text_fields.append({"text": text})
        return text_fields

    def analyze_suncare_ingredients(self, raw_text: str) -> dict:
        if not raw_text:
            return {"is_suncare": False, "detected_ingredients": []}

        raw_text = re.sub(r'[\d\.]', '', raw_text) 
        tokens = [t.strip() for t in re.split(r'[,.\n\s]+', raw_text) if len(t.strip()) > 1]

        detected = []
        master_names = list(self.ingredient_dict.keys())

        for token in tokens:
            # 1. 직매칭
            if token in self.ingredient_dict:
                if {"name": token} not in detected:
                    detected.append({"name": token})
                continue
            
            # 2. 퍼지 매칭
            match = process.extractOne(token, master_names, scorer=fuzz.partial_ratio)
            if match and match[1] >= 85:
                if {"name": match[0]} not in detected:
                    detected.append({"name": match[0]})

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
    
    def get_text(self, image_bytes: bytes):
        image_np = self.preprocess_image_bytes(image_bytes)
        return self.request_full_image_ocr(image_np)