# 🔌 SunCare API 명세 (v2 — DB 스키마 기준)

> 프론트엔드 `src/api/*.js`가 호출하는 엔드포인트 명세.
> 현재 mock으로 동작 중 — 백엔드 연결 시 이 명세대로 구현해주세요.
> 📅 2026-05-13 DB멘토링 결과 반영.

---

## 🌐 공통 사항

- **Base URL**: `/api` (개발), 환경변수 `VITE_API_BASE_URL`로 변경 가능
- **인증**: 모든 요청에 `Authorization: Bearer <token>` 헤더 자동 첨부 (로그인/회원가입 제외)
- **Content-Type**: `application/json` (이미지 업로드만 `multipart/form-data`)
- **에러 응답 형식 (제안)**:
  ```json
  { "message": "에러 메시지", "code": "ERROR_CODE" }
  ```

---

# 🔐 Auth API

## 1. 로그인 — `POST /auth/login`

**Request**

```json
{
  "id": "myaccount",
  "password": "string"
}
```

> 📌 로그인 키는 **id**(아이디). email 아님.

**Response 200**

```json
{
  "token": "jwt-token-string",
  "user": {
    "user_idx": 1,
    "id": "myaccount",
    "name": "정아인",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Response 401**

```json
{ "message": "아이디 또는 비밀번호가 일치하지 않습니다." }
```

---

## 2. 회원가입 — `POST /auth/signup`

**Request**

```json
{
  "id": "myaccount",
  "password": "string",
  "name": "정아인",
  "email": "user@example.com",
  "phone": "010-1234-5678"
}
```

> 📌 `role`은 백엔드에서 **자동 부여** (프론트에서 안 보냄).

**Response 200**

```json
{
  "success": true,
  "user": {
    "user_idx": 1,
    "id": "myaccount",
    "name": "정아인",
    "email": "user@example.com"
  }
}
```

**Response 409 (중복)**

```json
{ "message": "이미 사용 중인 아이디입니다.", "field": "id" }
```

> 💡 unique 제약: tb_user(email, phone). id도 보통 unique.

---

## 3. 로그아웃 — `POST /auth/logout`

**Request**: 본문 없음

**Response 200**

```json
{ "success": true }
```

---

# 👤 Profile API (tb_profile)

## 4. 내 프로필 조회 — `GET /profile`

**Response 200**

```json
{
  "profile_idx": 1,
  "user_id": 1,
  "skin_type": "건성",
  "senstive_yn": 4,
  "prod_type": "크림",
  "avoid_ingredient": "[\"옥시벤존\",\"향료\",\"에탄올\"]",
  "joined_at": "2026-05-13T10:00:00Z"
}
```

> 📌 `avoid_ingredient`는 **JSON 배열 문자열**. 프론트에서 `JSON.parse()` 해서 사용.

**Response 200 (프로필 미설정)**

```json
null
```

**필드 값**

- `skin_type`: `"지성" | "건성" | "복합성" | "중성" | "민감성"`
- `senstive_yn`: 정수 `1~5` (1=낮음, 5=매우 민감) ⚠️ **백엔드 확정 필요**
- `prod_type`: `"에센스" | "크림" | "젤" | "스틱" | "스프레이"`
- `avoid_ingredient`: JSON 배열 문자열 (자유 입력)

---

## 5. 프로필 저장/수정 — `PUT /profile`

**Request**

```json
{
  "skin_type": "건성",
  "senstive_yn": 4,
  "prod_type": "크림",
  "avoid_ingredient": "[\"옥시벤존\",\"향료\"]"
}
```

**Response 200**: GET 응답과 동일한 형태

---

# 🔍 Analysis API (tb_upload + tb_analysis)

## 6. 제품 분석 — `POST /analyze`

**Content-Type**: `multipart/form-data`

**Request (FormData)**

| 필드                 | 타입   | 필수 | 설명                 |
| -------------------- | ------ | ---- | -------------------- |
| `prod_name`        | string | ✓   | 제품명 (사용자 입력) |
| `product_image`    | File   | -    | 제품 사진            |
| `ingredient_image` | File   | ✓   | 성분표 사진          |

> 💡 백엔드는 내부적으로 tb_upload에 파일 저장 → tb_analysis 생성 → 추천 산출 → tb_recommendation 저장.

**Response 200**

```json
{
  "analysis_idx": 12,
  "file_idx": 34,
  "model_name": "yolo-v8-sunscreen-v1",
  "prod_code": "P001",
  "prod_name": "테스트 선크림 SPF50+",
  "suitability_score": 82,
  "analysis_result": {
    "status": "적합",
    "summary": "사용자의 건성·민감 피부에 옥시벤존이 자극이 될 수 있어, 무기자차 기반 제품을 추천합니다.",
    "risk_ingredients": [
      { "name": "옥시벤존", "reason": "민감성 피부에 자극이 될 수 있음" }
    ],
    "key_ingredients": [
      { "name": "나이아신아마이드", "benefit": "미백, 피부 장벽 강화" }
    ]
  },
  "analyzed_at": "2026-05-13T10:30:00Z"
}
```

> 📌 `analysis_result`는 tb_analysis 컬럼에 **JSON 문자열로 저장**되지만 API 응답에선 **파싱된 객체**로 내려보내주세요. (프론트에서 또 파싱 안 하게)

**필드 값**

- `suitability_score`: 0~100 정수
- `analysis_result.status`: `"적합" | "주의" | "부적합"` 중 하나
- 추천 제품은 **`tb_recommendation` 별도 조회** → 아래 9번 참고

---

## 7. 분석 히스토리 목록 — `GET /analyses`

**Response 200**

```json
[
  {
    "analysis_idx": 12,
    "prod_name": "테스트 선크림",
    "suitability_score": 82,
    "status": "적합",
    "analyzed_at": "2026-05-13T10:30:00Z"
  }
]
```

> 💡 목록은 요약 필드만. 상세는 `/analyses/:id`로.
> 정렬: 최신순 (`analyzed_at` desc), 현재 로그인 사용자 본인 것만.

---

## 8. 분석 상세 — `GET /analyses/:analysis_idx`

**Response 200**: `/analyze` 응답과 동일한 전체 객체.

**Response 404**

```json
{ "message": "분석 결과를 찾을 수 없습니다." }
```

---

# ✨ Recommendation API (tb_recommendation)

## 9. 추천 제품 조회 — `GET /recommendations?analysis_idx=12`

특정 분석 결과에 대한 추천 제품 목록.

**Response 200**

```json
[
  {
    "reco_idx": 5,
    "prod_idx": 7,
    "prod": {
      "prod_idx": 7,
      "prod_name": "마일드 미네랄 선크림",
      "brand_name": "SunSafe",
      "spf_val": "SPF50+",
      "pa_val": "PA++++",
      "uv_type": "무기자차"
    },
    "reco_reason": "건성·민감 피부에 자극이 적은 무기자차 성분 위주.",
    "created_at": "2026-05-13T10:30:01Z"
  }
]
```

> 💡 이미지/가격/쇼핑몰 링크는 현재 DB에 없음. 추후 추가 협의.

---

# 🛍️ Product API (tb_product + tb_product_detail + tb_ingredient)

## 10. 전체 제품 목록 — `GET /products`

**Response 200**

```json
[
  {
    "prod_idx": 1,
    "prod_name": "마일드 미네랄 선크림",
    "brand_name": "SunSafe",
    "spf_val": "SPF50+",
    "pa_val": "PA++++",
    "uv_type": "무기자차",
    "created_at": "2026-05-13T10:00:00Z"
  }
]
```

---

## 11. 제품 상세 + 성분 정보 — `GET /products/:prod_idx`

**Response 200**

```json
{
  "prod_idx": 1,
  "prod_name": "마일드 미네랄 선크림",
  "brand_name": "SunSafe",
  "spf_val": "SPF50+",
  "pa_val": "PA++++",
  "uv_type": "무기자차",
  "ingredients": [
    {
      "ingre_idx": 10,
      "ingre_name": "산화아연",
      "mixed_purpose": "자외선 차단",
      "ewg_grade": 1,
      "skin_warning": "민감성 피부에 안전",
      "ingre_content": 15.0,
      "ingre_unit": "%"
    }
  ]
}
```

---

# 🎯 백엔드 구현 우선순위 (제안)

| 순서          | 엔드포인트                                             | 이유            |
| ------------- | ------------------------------------------------------ | --------------- |
| **MVP** | `/auth/*`, `/profile`, `/analyze`                | 메인 플로우     |
| **2차** | `/analyses`, `/analyses/:id`, `/recommendations` | 결과/마이페이지 |
| **3차** | `/products`, `/products/:id`                       | 제품 카탈로그   |

---

# ❓ 추가 협의 필요 항목

1. **senstive_yn 정확한 값 범위** (현재 1~5 가정)
2. **제품 이미지/가격/쇼핑몰 URL**: 추후 tb_product에 컬럼 추가 시점/방식
3. **이미지 업로드**: 멀티파트 직접 vs S3 presigned URL
4. **JWT 만료 시간 / 리프레시 토큰**
5. **CORS 허용 origin**
