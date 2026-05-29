# backend/ai/models/ingredient_matcher.py
import re
from collections import defaultdict
from rapidfuzz import process, fuzz
# 동기식 pymysql 및 urlparse 대신 비동기 세션을 가져옵니다.
from backend.src.db.connection import AsyncSessionLocal
from sqlalchemy import text

# 🌟 매칭 성능 / 정확도 튜닝 상수
MIN_QUERY_LEN = 2
LEN_RATIO_LOW = 0.5     # query 길이의 50% 미만 후보 제외
LEN_RATIO_HIGH = 2.0    # query 길이의 200% 초과 후보 제외
MATCH_SCORE_CUTOFF = 80

class Ingredient_Matcher:
    def __init__(self):
        self.ingredient_map = {}
        self.ingredient_names = []
        # 🌟 길이별 인덱스: { 길이: [성분명, ...] } — 서버 시작 시 1회만 생성
        self.length_index = defaultdict(list)

    # 서버 시작 시 main.py의 lifespan에서 호출해 줄 비동기 초기화 메서드
    async def initialize(self):
        self.ingredient_map = await self._load_ingredients()
        self.ingredient_names = list(self.ingredient_map.keys())
        # 길이 인덱스 사전 생성
        for name in self.ingredient_names:
            self.length_index[len(name)].append(name)
        print(f"[Matcher] {len(self.ingredient_names)} 성분 로드, 길이 인덱스 {len(self.length_index)} buckets")

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
        """
        🌟 최적화 — 663 segments × 7000 ingredients = 460만 비교를 10~30배 빠르게
        1) fuzz.partial_ratio + score_cutoff=80 (조기 종료)
        2) 길이 인덱스로 후보 범위 1/10로 축소
        3) 중복 query 제거 (set)
        4) 한 성분이 여러 query에 매칭 시 중복 방지
        5) 결과를 ingre_name 알파벳순 정렬 → 매번 같은 순서 보장 (결과 일관성)
        """
        # ── 사전 필터: 텍스트 정제 + 중복 query 제거 ──
        seen_queries = set()
        unique_queries = []
        for raw_text in extracted_texts:
            text_val = self.clean_text(raw_text)
            if not text_val or len(text_val) < MIN_QUERY_LEN:
                continue
            if text_val in seen_queries:
                continue
            seen_queries.add(text_val)
            unique_queries.append((raw_text, text_val))

        matched_names_set = set()
        matched_results = []

        for raw_text, text_val in unique_queries:
            q_len = len(text_val)
            min_len = max(MIN_QUERY_LEN, int(q_len * LEN_RATIO_LOW))
            max_len = max(min_len, int(q_len * LEN_RATIO_HIGH))

            # 🌟 길이 인덱스로 후보군 추리기 (7000개 → 평균 500~1000개)
            candidates = []
            for l in range(min_len, max_len + 1):
                bucket = self.length_index.get(l)
                if bucket:
                    candidates.extend(bucket)

            if not candidates:
                continue

            result = process.extractOne(
                text_val,
                candidates,
                scorer=fuzz.partial_ratio,
                score_cutoff=MATCH_SCORE_CUTOFF,
            )
            if not result:
                continue

            best_match_name = result[0]
            if best_match_name in matched_names_set:
                continue
            matched_names_set.add(best_match_name)

            matched_data = self.ingredient_map[best_match_name].copy()
            matched_data['ocr_text'] = raw_text
            matched_results.append(matched_data)

        # 🌟 결과 정렬: ewg_grade 낮은 순(안전한 것 우선) → ingre_name 사전순
        #    매번 같은 input 에 같은 output 보장 → "분석할 때마다 다른 성분" 문제 해결
        matched_results.sort(key=lambda x: (
            x.get('ewg_grade') if x.get('ewg_grade') is not None else 99,
            x.get('ingre_name', '')
        ))

        return matched_results