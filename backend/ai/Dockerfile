# /backend/ai/Dockerfile
FROM python:3.10-slim
WORKDIR /app

# OpenCV 등 이미지 처리에 필요한 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8001

# 🌟 수정된 부분: main:app -> models.main:app 으로 변경
CMD ["uvicorn", "models.main:app", "--host", "0.0.0.0", "--port", "8001"]