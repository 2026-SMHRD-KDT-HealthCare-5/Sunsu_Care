import re
from rapidfuzz import fuzz 

class OcrService:
    def __init__(self):
        # 1. 정규화된 기준 성분 사전 (무기자차는 2개가 전부)
        self.physical_ingredients = ["티타늄디옥사이드", "징크옥사이드"]
        
        # 2. 최신 K-Beauty 선크림 필수 유기자차 성분 대폭 확장
        self.chemical_ingredients = [
            "에칠헥실메톡시신나메이트", "아보벤존", "옥토크릴렌", "호모살레이트", 
            "에칠헥실살리실레이트",  # 기본 유기자차
            
            "디에틸아미노하이드록시벤조일헥실벤조에이트", # 유비날 A 플러스
            "비스-에칠헥실옥시페놀메톡시페닐트리아진",     # 티노소브 S
            "에칠헥실트리아존",                            # 유비날 T 150
            "드로메트리조트리스일록산",                    # 멕소릴 XL
            "테레프탈릴리덴디캠퍼설포닉애씨드"             # 멕소릴 SX
        ]

    def analyze_suncare_ingredients(self, raw_text: str) -> dict:
        # 텍스트가 비어있을 때 예외 처리 (pipeline.py의 Fallback 스키마와 통일)
        if not raw_text or not raw_text.strip():
            return {
                "is_suncare": False, 
                "suncare_type": "성분표 및 텍스트 미검출", 
                "tags": [], 
                "detected_ingredients": {"physical": [], "chemical": []}
            }

        # 미백/주름 태스크용 전체 텍스트 공백 제거
        clean_text_full = re.sub(r'[\s\n]+', '', raw_text)
        
        # 성분 단위 분할 (숫자 뒤의 마침표는 제외하는 정규식)
        raw_tokens = re.split(r'[,.\n](?!\d)', raw_text)
        
        ingredients_list = []
        for t in raw_tokens:
            cleaned = re.sub(r'[^가-힣a-zA-Z0-9%]', '', t).strip()
            if len(cleaned) > 1:
                ingredients_list.append(cleaned)

        detected_physical = set()
        detected_chemical = set()
        
        for ing in ingredients_list:
            if "부틸옥틸" in ing:  # 자외선 차단 필터가 아닌 자차 용제(Solvent) 필터링
                continue
            
            # 토큰 길이가 5자 이상일 때만 유사도(Fuzzy) 매칭 허용하여 오탐 방지
            is_long_token = len(ing) >= 5
            
            # 무기 자차 매칭
            for p_ing in self.physical_ingredients:
                if p_ing in ing:
                    detected_physical.add(p_ing)
                elif is_long_token and fuzz.partial_ratio(p_ing, ing) >= 90:
                    detected_physical.add(p_ing)
                    
            # 유기 자차 매칭
            ing_lower = ing.lower()
            for c_ing in self.chemical_ingredients:
                c_ing_lower = c_ing.lower()
                if c_ing_lower in ing_lower:
                    detected_chemical.add(c_ing)
                elif is_long_token and fuzz.partial_ratio(c_ing_lower, ing_lower) >= 90:
                    detected_chemical.add(c_ing)

        has_physical = len(detected_physical) > 0
        has_chemical = len(detected_chemical) > 0
        
        # 자차 타입 판정 로직
        suncare_type = "일반 화장품"
        if has_physical and has_chemical: 
            suncare_type = "혼합자차"
        elif has_physical: 
            suncare_type = "무기자차"
        elif has_chemical: 
            suncare_type = "유기자차"

        # 기능성 성분 태깅
        tags = []
        if "나이아신아마이드" in clean_text_full: 
            tags.append("미백")
        if "아데노신" in clean_text_full: 
            tags.append("주름개선")

        return {
            "is_suncare": has_physical or has_chemical,
            "suncare_type": suncare_type,
            "tags": tags,
            "detected_ingredients": {
                "physical": list(detected_physical),
                "chemical": list(detected_chemical)
            }
        }
    
    def evaluate_compatibility(self, analysis_result, user_profile):
        """
        analysis_result: 위에서 만든 성분 분석 결과
        user_profile: Node.js에서 넘겨받은 유저 정보 (dict)
        """
        score = 100
        reasons = []
        status = "RECOMMENDED" # RECOMMENDED, CAUTION, NOT_RECOMMENDED

        # 1. 기피 성분 체크 (최우선)
        avoid_ingredients = user_profile.get('avoid_ingredient', [])
        if isinstance(avoid_ingredients, str):
            try:
                import json
                avoid_ingredients = json.loads(avoid_ingredients)
            except:
                avoid_ingredients = []
                
        found_avoid = [ing for ing in (analysis_result['detected_ingredients']['physical'] + 
                                      analysis_result['detected_ingredients']['chemical']) 
                      if ing in avoid_ingredients]
        
        if found_avoid:
            score -= 60
            status = "NOT_RECOMMENDED"
            reasons.append(f"기피 성분({', '.join(found_avoid)})이 포함되어 있습니다.")

        # 2. 민감도 체크
        if user_profile.get('sensitivity') == 'Y' and analysis_result['suncare_type'] == '유기자차':
            score -= 20
            status = "CAUTION" if status != "NOT_RECOMMENDED" else status
            reasons.append("유기자차 성분이 민감한 피부에 자극을 줄 수 있습니다.")

        # 3. 피부 타입별 보정 (예시: 지성)
        if user_profile.get('skin_type') == '지성' and analysis_result['suncare_type'] == '무기자차':
            reasons.append("무기자차 특유의 사용감이 답답할 수 있습니다.")

        return {
            "score": max(score, 0),
            "status": status,
            "reasons": reasons
        }