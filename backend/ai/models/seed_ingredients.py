import os
import requests
import pymysql
from urllib.parse import urlparse, unquote
from backend.ai.models.config import Config

def fetch_and_save_ingredients():
    try:
        # 1. DATABASE_URL 파싱
        db_url = Config.DATABASE_URL
        parsed = urlparse(db_url.replace("mysql+pymysql://", "http://"))
        db_config = {
            'host': parsed.hostname,
            'port': parsed.port or 3312,
            'user': parsed.username,
            'password': parsed.password,
            'db': parsed.path.lstrip('/'),
            'charset': 'utf8mb4',
            'cursorclass': pymysql.cursors.DictCursor
        }

        # 2. API 설정
        service_key = os.getenv("PUBLIC_API_KEY")
        if not service_key:
            print("환경 변수 PUBLIC_API_KEY가 없습니다.")
            return
        
        decoded_key = unquote(service_key)
        api_url = "http://apis.data.go.kr/1471000/CsmtcsIngdCpntInfoService01/getCsmtcsIngdCpntInfoService01"

        print("식약처 성분 데이터 수집을 시작합니다.")

        params = {
            'serviceKey': decoded_key,
            'type': 'json',
            'numOfRows': 100,
            'pageNo': 1
        }
        
        response = requests.get(api_url, params=params, timeout=15)

        if response.status_code == 200:
            res_data = response.json()
            items = res_data.get('body', {}).get('items', [])
            if not items:
                print("수집된 데이터가 없습니다.")
                return

            conn = pymysql.connect(**db_config)
            try:
                with conn.cursor() as cursor:
                    count = 0
                    for item in items:
                        name = item.get('INGR_KOR_NAME')
                        purpose = item.get('INGR_PURP_NAME') or '기타'
                        
                        if not name: continue
                        
                        # EWG 등급을 1(Green 등급을 의미하는 숫자로 가정)로 전달
                        sql = """
                        INSERT INTO tb_ingredient (ingre_name, mixed_purpose, ewg_grade, skin_warning)
                        VALUES (%s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE 
                            mixed_purpose = VALUES(mixed_purpose),
                            skin_warning = VALUES(skin_warning)
                        """
                        # 숫자로 입력
                        cursor.execute(sql, (name, purpose, 1, '없음'))
                        count += 1
                    conn.commit()
                    print(f"동기화 완료: {count}개의 성분이 저장되었습니다.")
            finally:
                conn.close()
        else:
            print(f"상태 코드: {response.status_code}, 메시지: {response.text}")

    except Exception as e:
        print(f"치명적 에러 발생: {e}")

if __name__ == "__main__":
    fetch_and_save_ingredients()