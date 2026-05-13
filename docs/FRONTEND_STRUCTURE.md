# 🌞 SunCare Frontend — 백엔드 협업용 구조 안내

> 본 문서는 **백엔드 팀이 프론트엔드 구조를 파악하고 API를 설계**하기 위한 안내서입니다.
> 디자인 적용 전 **구조 합의**가 목적입니다.

---

## 📋 한눈 요약

- **프레임워크**: React 19 + Vite + JavaScript
- **상태 관리**: `useState` + `localStorage` (Redux 미사용)
- **통신**: axios — 현재 mock 함수, 백엔드 완성 시 한 줄씩 교체 예정
- **인증**: JWT 토큰 (`localStorage.authToken`, 모든 요청에 자동 첨부)
- **메인 플로우**: 회원가입 → 로그인 → 피부정보 입력 → 제품 분석 → 결과/추천 → 가이드/히스토리

---

## 🛣️ 페이지 ↔ API 매핑

| 페이지         | URL              | 호출 API                      | 비고                     |
| -------------- | ---------------- | ----------------------------- | ------------------------ |
| 메인           | `/`            | -                             | 정적                     |
| 로그인         | `/login`       | `POST /auth/login`          | 성공 시 토큰 저장        |
| 회원가입       | `/signup`      | `POST /auth/signup`         | 성공 시 /login           |
| 피부 정보 입력 | `/profile`     | `GET`, `PUT /profile`     | 진입 시 GET, 저장 시 PUT |
| 제품 스캔      | `/scan`        | `POST /analyze` (multipart) | 이미지 업로드            |
| 분석 결과      | `/result`      | (캐시)                        | localStorage의 최신 결과 |
| 세안 가이드    | `/guide`       | -                             | profile + result 조합    |
| 마이페이지     | `/mypage`      | `GET /history`              | 분석 히스토리            |
| 히스토리 상세  | `/history/:id` | `GET /history/:id`          | 특정 분석 상세           |

---

## 📂 폴더 구조 (요약)

```
frontend/src/
 ┣ api/              ⭐ 백엔드 호출 함수 모음 (현재 mock - 백엔드 연동 시 여기만 수정)
 ┣ components/       UI 부품 (common / profile / product / result)
 ┣ data/             Mock 데이터 (백엔드 완성 시 제거 예정)
 ┣ hooks/            useAuth, useImagePreview, useLocalStorage
 ┣ layouts/          MainLayout (Header + BottomNav + Footer)
 ┣ pages/            라우트별 페이지 9개
 ┣ routes/           AppRouter
 ┣ styles/           variables.css 기반 디자인 토큰
 ┗ utils/            storage, validation, formatDate
```

> 📌 **백엔드 팀이 가장 봐야 할 폴더**: `src/api/` — 현재 mock 시그니처가 그대로 API 명세입니다.

---

## 💾 localStorage 사용 정책

| 키                  | 값                  | 백엔드 매핑 힌트           |
| ------------------- | ------------------- | -------------------------- |
| `authToken`       | JWT 문자열          | 로그인 응답의 token        |
| `userEmail`       | 이메일              | 표시용 (User 테이블)       |
| `userProfile`     | 피부 정보 JSON      | profile 테이블             |
| `analysisHistory` | 분석 결과 JSON 배열 | analysis 테이블 (사용자별) |
| `lastResult`      | 최신 분석 결과      | analysis 테이블 (최신 1건) |

> 📌 localStorage는 **오프라인 캐시**용. 백엔드 연동 후엔 GET 응답으로 덮어쓰는 패턴.

---

## 🔐 인증 흐름

```
1. [Login] POST /auth/login  →  서버가 JWT 발급
2. 프론트: localStorage.setItem('authToken', token)
3. 이후 모든 요청 헤더에 자동 첨부: Authorization: Bearer <token>
   (axios 인터셉터에서 처리 — src/api/axiosInstance.js)
4. 401 응답 시 자동 로그아웃 처리 예정 (현재 자리만 마련)
```

## 📦 데이터 스키마 (실제 DB — 2026-05-13 멘토링 반영)

### tb_user (사용자)

- `user_idx` (PK, AUTO_INCREMENT)
- `id` (VARCHAR 50) — **로그인용 아이디**
- `password_hash` (VARCHAR 255)
- `name`, `email`, `phone`
- `role` (VARCHAR 20) — 가입 시 자동 부여
- `created_at`, `updated_at`, `deleted_at`
- UNIQUE: (email, phone)

### tb_profile (피부 프로필, User 1:1)

- `profile_idx` (PK)
- `user_id` (FK → tb_user)
- `skin_type`: 지성 / 건성 / 복합성 / 중성 / 민감성
- `senstive_yn`: **레벨 1~5** (백엔드 확정 필요)
- `prod_type`: **에센스 / 크림 / 젤 / 스틱 / 스프레이**
- `avoid_ingredient`: **JSON 배열 문자열** (예: `'["옥시벤존","향료"]'`)

### tb_upload (업로드 파일)

- `file_idx` (PK)
- `user_idx` (FK)
- `file_name`, `file_ext`, `file_size`, `uploaded_at`

### tb_analysis (YOLO 분석)

- `analysis_idx` (PK)
- `file_idx` (FK → tb_upload)
- `model_name`, `prod_code`, `prod_name`
- `analysis_result` (**TEXT - JSON 문자열**): `{ status, summary, risk_ingredients[], key_ingredients[] }`
- `suitability_score` (0~100)
- `analyzed_at`

### tb_product (제품)

- `prod_idx` (PK)
- `prod_name`, `brand_name`
- `spf_val`, `pa_val`, `uv_type`
- `created_at`
- ⚠️ 이미지/가격/쇼핑몰 URL 없음 → 후속 협의 예정

### tb_ingredient (성분 마스터)

- `ingre_idx` (PK)
- `ingre_name`, `mixed_purpose`
- `ewg_grade` (INT)
- `skin_warning`

### tb_product_detail (제품-성분 매핑)

- `mixed_idx` (PK)
- `prod_idx` (FK), `ingre_idx` (FK)
- `ingre_content` (DECIMAL), `ingre_unit`

### tb_recommendation (추천)

- `reco_idx` (PK)
- `user_idx` (FK), `prod_idx` (FK)
- `reco_reason` (TEXT)
- `created_at`

> 📌 응답 JSON 모양은 [`API_SPEC.md`](./API_SPEC.md) 참고.
>

## 🚀 실행 방법 (받아서 돌려보기)

```bash
cd frontend
npm install
npm run dev
```

→ http://localhost:5173

> 💡 백엔드 없이도 mock으로 모든 화면이 동작합니다.

---

## 🔄 백엔드 연결 시 변경 흐름

`src/api/*.js` 안의 mock 부분만 교체:

```js
// 현재 (mock)
export const analyze = async (formData) => {
  await delay(1500)
  return { ...mockAnalysisResult }
}

// 백엔드 연결 후 (한 줄 교체)
export const analyze = async (formData) => {
  const { data } = await api.post('/analyze', formData)
  return data
}
```

페이지/컴포넌트 코드는 **단 한 줄도** 안 건드려도 됩니다.

---

## 📌 백엔드 팀에 협의 요청 사항

1. **API base URL**: 개발/스테이징/프로덕션 URL?
2. **인증 방식 확정**: JWT 맞나요? 만료 시간? 리프레시 토큰?
3. **이미지 업로드 방식**: multipart 직접? 또는 S3 presigned URL 방식?
4. **에러 응답 형식 통일**: `{ message, code }` 형태로 통일할까요?
5. **분석 응답 시간**: 평균? (현재 1.5초 mock — 실제론 더 길 수 있어 로딩 UX 조정 필요)
6. **status 산출 기준**: 점수 ↔ '적합/주의/부적합' 임계값?
7. **CORS**: 개발 환경 origin 허용 필요
