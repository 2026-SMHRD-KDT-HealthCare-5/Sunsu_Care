import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
ai_dir = os.path.dirname(current_dir)
backend_dir = os.path.dirname(ai_dir)

MODEL_PATH = os.path.join(ai_dir, 'weights', 'best.pt')
IMG_PATH = os.path.join(backend_dir, 'data', 'box.jpg')
RUNS_PATH = os.path.join(ai_dir, 'runs')

# CLOVA OCR API 정보 (.env에서 읽어오기)
API_URL = os.environ.get("CLOVA_API_URL")
SECRET_KEY = os.environ.get("CLOVA_SECRET_KEY")