# backend/ai/models/ocr_service.py
import io
import re
import json
import requests
import numpy as np
from PIL import Image
from rapidfuzz import fuzz, process
from backend.ai.models.config import get_settings
# 의존성 함수 대신 비동기 세션 팩토리와 SQLAlchemy text 객체를 임포트합니다.
from backend.src.db.connection import AsyncSessionLocal
from sqlalchemy import text

class OcrService:
    def __init__(self):
        self.settings = get_settings()
        self.ocr_url = self.settings.CLOVA_API_URL
        self.ocr_secret = self.settings.CLOVA_SECRET_KEY
        self.ingredient_dict = {}  # 인스턴스 생성 시점에는 빈 값으로 초기화합니다.
    
    # main.py의 lifespan에서 서버 기동 시 호출할 비동기 초기화 함수
    async def initialize(self):
        self.ingredient_dict = await self._load_ingredients_from_db()
    
    # 비동기 방식으로 마스터 데이터를 조회하도록 수정
    async def _load_ingredients_from_db(self):
        ingredient_dict = {}
        
        async with AsyncSessionLocal() as session:
            try:
                sql = text("SELECT ingre_name, ewg_grade, skin_warning FROM tb_ingredient")
                result = await session.execute(sql)
                results = result.fetchall()
                
                for row in results:
                    # SQLAlchemy 튜플 결과 인덱스 접근 (row[0]: 이름, row[1]: 등급, row[2]: 경고)
                    ingredient_dict[row[0]] = {
                        'ewg': row[1],
                        'warning': row[2]
                    }
            except Exception as e:
                print(f"OcrService DB 로드 중 에러 발생: {e}")
                
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
                text_val = field.get("inferText") or ""
                if text_val: text_fields.append({"text": text_val})
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