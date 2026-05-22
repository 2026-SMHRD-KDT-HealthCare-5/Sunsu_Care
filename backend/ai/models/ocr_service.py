# backend/ai/models/ocr_service.py 수정본

import re
import pymysql
from urllib.parse import urlparse
from rapidfuzz import fuzz
from backend.ai.models.config import Config

class OcrService:
    def __init__(self):
        # DB에서 {성분명: {'purpose': '...', 'ewg': ...}} 형태의 사전 로드
        self.ingredient_dict = self._load_ingredients_from_db()

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
                sql = "SELECT ingre_name, mixed_purpose, ewg_grade FROM tb_ingredient"
                cursor.execute(sql)
                results = cursor.fetchall()
                for row in results:
                    ingredient_dict[row['ingre_name']] = {
                        'purpose': row['mixed_purpose'],
                        'ewg': row['ewg_grade']
                    }
        finally:
            conn.close()
        return ingredient_dict

    def analyze_suncare_ingredients(self, raw_text: str) -> dict:
        if not raw_text or not raw_text.strip():
            return {"is_suncare": False, "suncare_type": "성분표 미검출", "detected_ingredients": []}

        # 1. OCR 텍스트 토큰화
        raw_tokens = re.split(r'[,.\n](?!\d)', raw_text)
        ingredients_list = []
        for t in raw_tokens:
            cleaned = re.sub(r'[^가-힣a-zA-Z0-9%]', '', t).strip()
            if len(cleaned) > 1:
                ingredients_list.append(cleaned)

        detected = []
        
        # 2. DB 데이터와 매칭
        for ing in ingredients_list:
            for master_name, info in self.ingredient_dict.items():
                if master_name in ing or fuzz.partial_ratio(master_name, ing) >= 90:
                    detected.append({
                        "name": master_name,
                        "purpose": info['purpose'],
                        "ewg": info['ewg']
                    })
                    break
        
        # 3. 자차 타입 판정 (무기/유기/혼합)
        physical_count = sum(1 for d in detected if "무기" in d['purpose'] or "물리" in d['purpose'])
        chemical_count = sum(1 for d in detected if "유기" in d['purpose'] or "화학" in d['purpose'])
        
        suncare_type = "일반 화장품"
        if physical_count > 0 and chemical_count > 0: suncare_type = "혼합자차"
        elif physical_count > 0: suncare_type = "무기자차"
        elif chemical_count > 0: suncare_type = "유기자차"

        return {
            "is_suncare": len(detected) > 0,
            "suncare_type": suncare_type,
            "detected_ingredients": detected
        }