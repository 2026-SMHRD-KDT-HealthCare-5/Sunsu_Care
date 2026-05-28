# backend/ai/models/ingredient_matcher.py
import re
import pymysql
from urllib.parse import urlparse, unquote
from rapidfuzz import process, fuzz
from backend.ai.models.config import Config

class Ingredient_Matcher:
    def __init__(self):
        self.ingredient_map = self._load_ingredients()
        self.ingredient_names = list(self.ingredient_map.keys())

    def _load_ingredients(self):
        """DATABASE_URL을 안전하게 파싱하여 데이터 로드"""
        # urlparse를 사용하여 특수문자가 섞인 암호도 안전하게 처리
        db_url = Config.DATABASE_URL.replace("mysql+pymysql://", "mysql://")
        url = urlparse(db_url)
        
        conn = pymysql.connect(
            host=url.hostname,
            port=url.port or 3306,
            user=url.username,
            password=unquote(url.password) if url.password else "",
            db=url.path.lstrip('/'),
            cursorclass=pymysql.cursors.DictCursor
        )
        try:
            with conn.cursor() as cursor:
                # 결과 페이지에 필요한 warning 정보도 함께 가져옴
                cursor.execute("SELECT ingre_name, ewg_grade, skin_warning FROM tb_ingredient")
                rows = cursor.fetchall()
            return {row['ingre_name']: row for row in rows}
        finally:
            conn.close()

    def clean_text(self, text):
        """OCR 텍스트에서 특수문자 및 줄바꿈 제거"""
        if not text: return ""
        # 한글, 영문, 숫자 제외한 노이즈 제거 및 공백 제거
        return re.sub(r'[^가-힣a-zA-Z0-9]', '', text).strip()

    def match_ingredients(self, extracted_texts: list):
        matched_results = []
        
        for raw_text in extracted_texts:
            text = self.clean_text(raw_text)
            if not text or len(text) < 2: continue # 너무 짧은 노이즈 무시

            # 퍼지 매칭 수행
            result = process.extractOne(text, self.ingredient_names, scorer=fuzz.WRatio)
            
            if result and result[1] >= 80:
                best_match_name = result[0]
                # 매칭된 성분 정보에 원본 OCR 텍스트도 보관 (디버깅용)
                matched_data = self.ingredient_map[best_match_name].copy()
                matched_data['ocr_text'] = raw_text
                matched_results.append(matched_data)
                
        return matched_results