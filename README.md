- Sun手 Care - YOLO 기반 선케어 제품 이미지 분석 및 맞춤형 추천 서비스

사용자가 선케어 제품 이미지를 업로드하면, YOLO 기반의 객체 탐지 기술로 제품을 식별하고 OCR을 통해 성분을 분석하여 사용자의 피부 타입에 최적화된 맞춤형 제품을 추천해 주는 통합 플랫폼입니다.

- 프로젝트 구조

Project Root
├── backend/            # Node.js 기반 API 서버
│   ├── ai/             # 선케어 제품 탐지(YOLO) 및 성분 분석(OCR) 엔진
│   ├── data/           # 제품 분석용 이미지 및 전처리 데이터
│   └── src/            # 서비스 로직 및 제품 추천 API
├── frontend/           # React 기반 사용자 인터페이스 (Vite)
├── docs/               # API 명세서 및 서비스 설계 문서
├── package.json        # npm 워크스페이스 통합 관리
└── README.md           # 프로젝트 메인 가이드 (현재 파일)

- 시작하기
이 프로젝트는 npm workspaces를 사용하므로, 루트 폴더에서 모든 환경을 한 번에 제어할 수 있습니다.

1. 환경 설정
  Python : 3.9+ (YOLOv8 모델 구동용)
  Node.js : 18.x+
  Database : MySQL (회원 정보 및 제품 데이터 관리)

2. 의존성 설치
루트 폴더에서 아래 명령어를 실행하세요.
npm install

3. 서비스 실행
# 서버와 클라이언트 동시 실행
npm run dev

# 백엔드(API * AI)만 실행
npm run back

# 프런트엔드만 실행
npm run front

- 핵심 기술
1. Object Detection : YOLOv8을 활용한 다양한 선케어 제품 패키지 탐지
2. Text Recognition : CLOVA OCR API를 이용한 전성분 텍스트 추출
3. Recommendation ALgorithm : 피부 타입별 성분 적합도 분석 및 맞춤형 스코어링

- 관련 문서
1. API 명세서
2. 선케어 추천 로직 설계