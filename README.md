# ☀ Sun手Care (선수케어)

> **AI 선크림 성분 분석 및 개인 맞춤 추천 서비스**
> YOLOv8 + CLOVA OCR로 선크림 라벨을 분석하고, 사용자의 피부 타입·활동 환경·기피 성분에 맞춰 0~100점의 적합도 점수와 Gemini AI 추천 이유를 제공하는 모바일 우선 웹 서비스.

[![Node](https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://python.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-4479A1?logo=mysql&logoColor=white)](https://mysql.com)

---

## 📑 목차

- [핵심 기능](#-핵심-기능)
- [시스템 아키텍처](#-시스템-아키텍처)
- [기술 스택](#-기술-스택)
- [폴더 구조](#-폴더-구조)
- [빠른 시작](#-빠른-시작)
- [환경변수](#-환경변수)
- [실행 명령 (npm scripts)](#-실행-명령-npm-scripts)
- [주요 성능 최적화](#-주요-성능-최적화)
- [API 엔드포인트](#-api-엔드포인트)
- [트러블슈팅](#-트러블슈팅)

---

## 🌟 핵심 기능

### 1. 선크림 라벨 성분 자동 추출
- 사용자가 카메라/이미지로 선크림 라벨 촬영
- **YOLOv8** 객체 탐지 → **CLOVA OCR** 텍스트 추출 → 성분 사전 매칭 (약 7,000개)
- 클라이언트 측 이미지 자동 리사이즈로 업로드 시간 90% 단축

### 2. 개인 맞춤 적합도 점수 (0~100점)
- 룰 기반 가중치 알고리즘 (`compatibilityScore.js`)
- BASE 70점 + EWG 위험 감점, 핵심 성분 가점, 기피 성분 매칭 감점, 피부 타입/환경 보정
- 4단계 상태: 최적(90+) / 적합(75+) / 주의(50+) / 부적합(<50)
- **frontend / backend 동일 로직** 공유로 결과 일관성 보장

### 3. 맞춤 추천 TOP 3 + AI 추천 이유
- 사용자 프로필 기반 300여 개 제품 중 적합도 상위 3개 자동 추천
- **Google Gemini** LLM으로 자연어 추천 이유 생성
- **다중 모델 자동 우회** (`gemini-2.5-flash → 2.0-flash → 2.5-flash-lite → 2.0-flash-lite`) — 429 한도 초과 시 즉시 다음 모델 시도
- **파일 영속 캐시** (서버 재시작 후에도 유지) → Gemini 호출 비용 0 + 응답 50ms

### 4. 분석 히스토리 (최대 5건)
- 사용자별 최대 5건 자동 관리, 초과 시 가장 오래된 항목 자동 삭제
- 같은 사진을 두 번 분석해도 **fingerprint 중복 제거**로 깔끔하게 유지
- DB `tb_ingredient.skin_warning` 컬럼 업데이트 시 **모든 히스토리에 즉시 반영**

---

## 🏗 시스템 아키텍처

```
┌──────────────────────────────────────────────────────┐
│            [ 모바일 브라우저 - React 19 ]              │
└────────────────────┬─────────────────────────────────┘
                     │ HTTPS + axios 인터셉터 (자동 라우팅)
        ┌────────────┴────────────┐
        ▼                         ▼
 ┌──────────────────┐    ┌────────────────────────┐
 │ Express + JWT    │    │ FastAPI + YOLO + OCR   │
 │   port 4000      │    │   port 8001            │
 └────────┬─────────┘    └───────────┬────────────┘
          │                          │
          ▼                          ▼
   ┌────────────┐           ┌────────────────┐
   │ MySQL 8.x  │           │ Gemini 2.x LLM │
   │ 8 tables   │           │ + 파일 캐시   │
   └────────────┘           └────────────────┘
```

### 핵심 설계 원칙
- **모바일 우선** (`max-width: 500px` 컨테이너)
- **단일 진실 공급원 (SSOT)** — 키/URL/색상/DB 모두 한 곳에서만 관리
- **컴포넌트별 로컬 CSS 변수** (`--mp-*`, `--pp-*` 등)
- **이벤트 기반 인증 동기화** (`dispatchEvent` + `storage` 이벤트)
- **방어적 비동기** (mutex, cancellation, 자동 우회)

---

## 🛠 기술 스택

### Frontend
- **React 19** + **Vite** (모바일 우선 SPA)
- **React Router** + state 패턴
- **Axios** 커스텀 인터셉터 (Express ↔ FastAPI 자동 라우팅, 401 자동 로그아웃)
- **Font Awesome** 아이콘
- 순수 CSS + 로컬 변수 (Tailwind 미사용)

### Backend (Express API)
- **Node.js 18+** + **Express 4**
- **MySQL2** (Promise + 풀)
- **JWT** (24시간 토큰) + **bcrypt** 해싱
- **Multer** 이미지 업로드

### AI Service (Python)
- **FastAPI** + **Uvicorn**
- **YOLOv8** (Ultralytics) — 라벨 영역 검출
- **CLOVA OCR API** — 한글 텍스트 추출
- **Rapidfuzz** + 길이 인덱스 — 463만 비교를 0.5초에 처리
- **AsyncIO** + **anyio** — OCR/YOLO 병렬 처리

### LLM
- **Google Gemini 2.5/2.0 Flash (Lite)** — 자연어 추천 이유 생성
- **파일 영속 캐시** + **다중 모델 cooldown Map** — 자동 우회 시스템

### Database (MySQL — 8 테이블)
```
tb_users          (회원)
tb_profile        (피부 프로필)
tb_upload         (업로드 파일)
tb_product        (제품 마스터)
tb_ingredient     (성분 사전 + skin_warning 컬럼)
tb_analysis       (분석 결과)
tb_analysis_log   (분석 로그)
tb_ai_reason_cache (Gemini 응답 캐시 — 옵션)
```

---

## 📁 폴더 구조

```
Sunsu_Care/
├── README.md
├── requirements.txt              # Python 의존성
├── package.json                  # 루트 (concurrently + workspaces)
│
├── backend/
│   ├── package.json
│   ├── server.js                 # Express 진입점
│   ├── .env                      # ⚠️ DB/JWT/Gemini 설정
│   ├── cache/
│   │   └── ai_reason_cache.json  # Gemini 응답 영속 캐시
│   ├── uploads/                  # Multer 업로드 저장소
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── suncareController.js   # ⭐ 메인 컨트롤러
│   │   │   ├── authController.js
│   │   │   └── profileController.js
│   │   ├── routes/
│   │   ├── services/
│   │   │   └── geminiService.js       # ⭐ 멀티 모델 Fallback
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js      # ⭐ JWT 만료 분기
│   │   ├── db/
│   │   │   ├── index.js               # MySQL 풀
│   │   │   ├── connection.py          # SQLAlchemy async
│   │   │   └── update_ingredient_warnings.sql  # 성분 효능 SEED
│   │   ├── scripts/
│   │   │   ├── updateIngredientWarnings.js     # ⭐ db:seed-warnings
│   │   │   └── checkIngredients.js             # 진단 도구
│   │   └── utils/
│   │       └── compatibilityScore.js  # 적합도 알고리즘
│   │
│   └── ai/
│       └── models/
│           ├── main.py                # FastAPI 진입점
│           ├── pipeline.py            # ⭐ OCR+YOLO 병렬
│           ├── ocr_service.py         # CLOVA OCR + YOLO 호출
│           ├── ingredient_matcher.py  # ⭐ Rapidfuzz 길이 인덱스
│           └── config.py
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    │
    └── src/
        ├── api/
        │   ├── axiosInstance.js       # ⭐ 자동 라우팅 + 401 처리
        │   ├── analysisApi.js
        │   ├── authApi.js
        │   └── profileApi.js
        ├── constants/                  # ⭐ SSOT
        │   ├── storageKeys.js
        │   ├── apiPaths.js
        │   ├── timings.js
        │   └── externalLinks.js
        ├── hooks/
        │   ├── useAuth.js             # ⭐ 이벤트 기반 동기화
        │   └── useImagePreview.js
        ├── utils/
        │   ├── compatibilityScore.js  # 적합도 (백엔드와 동일)
        │   ├── imageResize.js         # ⭐ Canvas 리사이즈
        │   └── storage.js
        ├── components/
        │   ├── common/                # Header, BottomNav, SideMenu, Modal 등
        │   └── product/
        │       └── ImageUploader.jsx
        ├── layouts/
        │   └── MainLayout.jsx
        ├── pages/                      # 11개 페이지
        │   ├── HomePage.jsx            # ⭐ Negative animation-delay 크로스페이드
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── LogoutPage.jsx
        │   ├── ProfilePage.jsx         # ⭐ 11단계 설문
        │   ├── ScanPage.jsx            # ⭐ 폴링 4중 안전망
        │   ├── HistoryDetailPage.jsx
        │   ├── MyPage.jsx              # ⭐ Fingerprint dedup
        │   ├── GuidePage.jsx
        │   ├── ShoppingPage.jsx
        │   └── AccountSettings.jsx
        ├── routes/
        │   └── AppRouter.jsx
        └── styles/
            ├── global.css
            ├── variables.css
            └── reset.css
```

---

## 🚀 빠른 시작

### 1. 사전 요구 사항
- **Node.js 18.x** 이상
- **Python 3.10** 이상
- **MySQL 8.0** 이상 (또는 호환 DBMS)
- Google AI Studio API 키 ([https://aistudio.google.com](https://aistudio.google.com))
- NAVER CLOVA OCR API 키

### 2. 클론 + 의존성 설치

```bash
git clone <repo-url>
cd Sunsu_Care

# Node 의존성 (workspaces 자동 처리 → root + backend + frontend)
npm install

# Python 의존성
pip install -r requirements.txt
```

### 3. 환경변수 설정

`backend/.env` 파일을 생성하고 다음 내용 입력:

```bash
# 서버
NODE_ENV=development
PORT=4000

# MySQL
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=sunsu_care
DATABASE_URL=mysql+asyncmy://your_user:your_password@your_db_host:3306/sunsu_care

# 보안
JWT_SECRET=your_jwt_secret_min_32_chars
INTERNAL_TOKEN=internal_service_to_service_token

# 서비스 통신
FASTAPI_BASE_URL=http://127.0.0.1:8001
EXTERNAL_BASE_URL=http://localhost:4000

# 이미지 / AI
MODEL_PATH=ai/weights/best.pt
MAX_IMAGE_SIZE=10485760
UPLOAD_MAX=10485760

# CLOVA OCR
CLOVA_API_URL=https://your-clova-endpoint
CLOVA_SECRET_KEY=your_clova_secret

# Gemini AI (필수)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
# 선택: 모델 우선순위 직접 지정 (없으면 자동 4개 fallback)
# GEMINI_MODELS=gemini-2.5-flash,gemini-2.0-flash,gemini-2.5-flash-lite,gemini-2.0-flash-lite
```

`frontend/.env` 파일:
```bash
VITE_API_BASE_URL=http://localhost:4000/api
VITE_INTERNAL_TOKEN=internal_service_to_service_token
```

### 4. DB 초기 세팅

```bash
# 테이블 스키마 적용
# (backend/src/db/DB멘토링.SQL 참조)

# ⭐ 성분 효능 설명 시드 (필수)
cd backend
npm run db:seed-warnings
```

### 5. 통합 실행

```bash
# 루트 폴더에서 — 3개 서버 동시 실행 (color-coded 로그)
npm run dev
```

콘솔 출력 예시:
```
[AI]    INFO:     Uvicorn running on http://127.0.0.1:8001       (보라)
[BACK]  Server listening on port 4000                            (청록)
[FRONT] VITE v5.x  ready in 320ms  ➜  Local:   http://localhost:5173  (초록)
```

브라우저에서 `http://localhost:5173` 접속.

---

## ⚙️ 환경변수

### 필수
| 키 | 설명 | 예시 |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL 연결 | 위 .env 참조 |
| `JWT_SECRET` | JWT 서명 키 (최소 32자) | 랜덤 문자열 |
| `INTERNAL_TOKEN` | Backend ↔ FastAPI 내부 인증 | 랜덤 문자열 |
| `CLOVA_API_URL`, `CLOVA_SECRET_KEY` | NAVER CLOVA OCR | NCP 콘솔에서 발급 |
| `GEMINI_API_KEY` | Google Gemini | AI Studio에서 발급 |

### 선택
| 키 | 기본값 | 설명 |
|---|---|---|
| `GEMINI_MODEL` | `gemini-2.5-flash` | 1순위 모델 (자동 fallback) |
| `GEMINI_MODELS` | (자동) | 콤마 구분 우선순위 직접 지정 |
| `FASTAPI_BASE_URL` | `http://127.0.0.1:8001` | FastAPI 주소 |
| `MAX_IMAGE_SIZE` | 10485760 (10MB) | 업로드 최대 크기 |
| `NODE_ENV` | `development` | `production` 으로 변경 시 로그 축소 |

---

## 📜 실행 명령 (npm scripts)

### 루트 (`Sunsu_Care/`)
| 명령 | 설명 |
|---|---|
| `npm run dev` | 🚀 **3개 서버 동시 실행** (AI + BACK + FRONT) |
| `npm run ai` | FastAPI (port 8001) 단독 실행 |
| `npm run back` | Express (port 4000) 단독 실행 |
| `npm run front` | Vite dev (port 5173) 단독 실행 |

### backend/
| 명령 | 설명 |
|---|---|
| `npm run dev` | nodemon으로 Express 실행 |
| `npm start` | production 실행 |
| **`npm run db:seed-warnings`** | ⭐ 성분 효능 설명(skin_warning) 일괄 업데이트 — **최초 1회 필수** |

### frontend/
| 명령 | 설명 |
|---|---|
| `npm run dev` | Vite dev 서버 |
| `npm run build` | production 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |

---

## ⚡ 주요 성능 최적화

| 항목 | Before | After | 기법 |
|---|---|---|---|
| **분석 1회 총 시간** | 20~25초 | **5~7초** | (전체 합산) |
| **이미지 업로드** | 5~10MB 그대로 | 500KB | Canvas 1024px + JPEG 0.78 |
| **OCR + YOLO** | 순차 8초 | 병렬 4초 | `asyncio.create_task` |
| **성분 매칭** | 4.3초 (663×7000) | **0.3초** | rapidfuzz + 길이 인덱스 |
| **폴링 첫 응답** | 1초 후 | 즉시 | `setInterval` 지연 절약 |
| **Gemini 캐시 hit** | - | 50ms | 파일 영속 캐시 |
| **Gemini 429 우회** | 실패 | 자동 | 4개 모델 cooldown 체인 |

상세한 학습 노트: `Sun手Care_학습노트.md` 참조

---

## 🔌 API 엔드포인트

### 인증
| Method | Path | 설명 |
|---|---|---|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| POST | `/api/auth/logout` | 로그아웃 |

### 프로필
| Method | Path | 설명 |
|---|---|---|
| GET | `/api/profile` | 내 프로필 조회 |
| POST | `/api/profile` | 프로필 저장/수정 |

### 분석 (Suncare)
| Method | Path | 설명 |
|---|---|---|
| POST | `/api/suncare/upload` | 이미지 업로드 → AI 분석 시작 |
| GET | `/api/suncare/tasks/:taskId` | 분석 진행 상태 폴링 |
| GET | `/api/suncare/analyses` | 내 분석 히스토리 5건 |
| POST | `/api/suncare/analyses/:id/save` | 히스토리 저장 |
| DELETE | `/api/suncare/analyses/:id` | 히스토리 삭제 |
| POST | `/api/suncare/ai-reason` | Gemini 추천 이유 생성 |
| GET | `/api/suncare/recommendations` | 맞춤 추천 제품 TOP 3 |
| POST | `/api/suncare/callbacks/suncare` | FastAPI → Express 콜백 (내부) |

### FastAPI (port 8001 직접)
| Method | Path | 설명 |
|---|---|---|
| GET | `/api/v1/tasks/:taskId` | 분석 결과 직접 조회 |
| GET | `/docs` | Swagger UI |

---

## 🔧 트러블슈팅

### Gemini 429 에러 (`limit: 0`)
**증상**: `Quota exceeded for metric: ...generate_content_free_tier_requests, limit: 0`
**원인**: 새 API 키가 GCP 콘솔에서 발급되어 무료 티어 미활성 상태
**해결**:
1. https://aistudio.google.com 에서 **"Create API key in new project"** 선택
2. (GCP 콘솔 아님)
3. `.env`의 `GEMINI_API_KEY` 교체 후 백엔드 재시작

### 분석이 계속 멈춰있음
**증상**: ScanPage에서 "분석 중..." 화면이 안 끝남
**원인 후보**:
- FastAPI 서버 미실행 → `npm run ai` 또는 `npm run dev` 확인
- AI 서버 콘솔에 `INFO: Uvicorn running on http://127.0.0.1:8001` 떠야 정상

### "유효 성분"으로만 표시됨
**원인**: 최초 DB 시드 미실행
**해결**:
```bash
cd backend
npm run db:seed-warnings
```

### JWT TokenExpiredError
**정상 동작**: 24시간 만료 후 자동으로 로그아웃 + 로그인 페이지 리다이렉트. 다시 로그인하면 됨.

### 백엔드 변경이 반영 안 됨
```powershell
# 모든 node/python 프로세스 강제 종료
Get-Process node, python -ErrorAction SilentlyContinue | Stop-Process -Force
cd C:\dev\Sunsu_Care
npm run dev
```

---

## 📚 추가 문서

- **학습 노트**: `Sun手Care_학습노트.md` (코드 깊이 학습 가이드, 18챕터)
- **빅데이터 분석 정의서**: `빅데이터분석정의서_SUNSU_Care.md`
- **PPT 제작 프롬프트**: `Sun手Care_PPT프롬프트.md`
- **DB 스키마**: `backend/src/db/DB멘토링.SQL`

---

## 📝 라이선스 / 기여

본 프로젝트는 학습 목적의 빅데이터/헬스케어 부트캠프 결과물입니다.

---

**문의 / 버그 리포트**는 Issues 탭에 남겨주세요. 🌞
