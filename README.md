# Sunsu Care
## YOLO 기반 선케어 제품 이미지 분석 및 맞춤형 추천 서비스

사용자가 선케어 제품 이미지를 업로드하면 YOLOv8 기반 객체 탐지로 제품을 식별하고, CLOVA OCR API를 통해 성분을 추출하여 사용자 피부 타입에 최적화된 맞춤형 제품을 추천하는 통합 플랫폼입니다.

---

### 핵심 기술
* 객체 탐지: YOLOv8 모델 활용
* 텍스트 인식: CLOVA OCR API 활용
* 추천 알고리즘: 사용자 피부 프로필 기반 스코어링

---

### 프로젝트 구조
* backend: Node.js API 서버
* backend/ai: Python FastAPI 분석 엔진
* frontend: React 및 Vite UI
* docs: 설계 문서
* package.json: 루트 통합 설정

---

### 시작하기

#### 1. 환경 설정
* Node.js 18.x 이상
* Python 3.9 이상
* MySQL 8.0 이상

#### 2. 의존성 설치

루트 폴더에서 Node.js 패키지 설치
npm install

AI 서버 필수 라이브러리 설치
pip install -r requirements.txt

#### 3. 서비스 실행
루트 폴더에서 실행
npm run dev

---

### 상세 문서
* API 명세서: docs/ 폴더 참조
* 추천 로직 설계: docs/ 폴더 참조