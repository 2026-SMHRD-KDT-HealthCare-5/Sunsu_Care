# backend/ai/models/ingredient_matcher.py
import re
from rapidfuzz import process, fuzz
# 동기식 pymysql 및 urlparse 대신 비동기 세션을 가져옵니다.
from backend.src.db.connection import AsyncSessionLocal
from sqlalchemy import text

class Ingredient_Matcher:
    def __init__(self):
        self.ingredient_map = {}
        self.ingredient_names = []

    # 서버 시작 시 main.py의 lifespan에서 호출해 줄 비동기 초기화 메서드
    async def initialize(self):
        self.ingredient_map = await self._load_ingredients()
        self.ingredient_names = list(self.ingredient_map.keys())

    async def _load_ingredients(self):
        """AsyncSessionLocal을 사용하여 안전하게 비동기로 데이터 로드"""
        ingredient_map = {}
        
        async with AsyncSessionLocal() as session:
            try:
                # 결과 페이지에 필요한 warning 정보도 함께 가져옴
                sql = text("SELECT ingre_name, ewg_grade, skin_warning FROM tb_ingredient")
                result = await session.execute(sql)
                rows = result.fetchall()
                
                # SQLAlchemy fetchall() row 결과 처리 (튜플 인덱스 접근)
                for row in rows:
                    ingre_name = row[0]
                    ingredient_map[ingre_name] = {
                        'ingre_name': row[0],
                        'ewg_grade': row[1],
                        'skin_warning': row[2]
                    }
            except Exception as e:
                print(f"Ingredient_Matcher DB 데이터 로드 중 에러 발생: {e}")
                
        return ingredient_map

    def clean_text(self, text):
        """OCR 텍스트에서 특수문자 및 줄바꿈 제거"""
        if not text: return ""
        # 한글, 영문, 숫자 제외한 노이즈 제거 및 공백 제거
        return re.sub(r'[^가-힣a-zA-Z0-9]', '', text).strip()

    def match_ingredients(self, extracted_texts: list):
        matched_results = []
        
        for raw_text in extracted_texts:
            text_val = self.clean_text(raw_text)
            if not text_val or len(text_val) < 2: continue # 너무 짧은 노이즈 무시

            # 퍼지 매칭 수행
            result = process.extractOne(text_val, self.ingredient_names, scorer=fuzz.WRatio)
            
            if result and result[1] >= 80:
                best_match_name = result[0]
                # 매칭된 성분 정보에 원본 OCR 텍스트도 보관 (디버깅용)
                matched_data = self.ingredient_map[best_match_name].copy()
                matched_data['ocr_text'] = raw_text
                matched_results.append(matched_data)
                
        return matched_results