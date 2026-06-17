# 📚 Sun手Care 프로젝트 기술 학습 노트

> SUNSU Care (선수케어) — YOLO + Gemini 기반 선크림 성분 분석 / 맞춤 추천 모바일 웹 서비스
> 최종 업데이트: 2026.05.29 · 학습용 핵심 코드 정리 v2 (성능 최적화 + 운영 안정성 추가)

---

## 🗂 목차

### Part 1 — 핵심 아키텍처
1. [프로젝트 아키텍처 한눈에 보기](#1-아키텍처)
2. [JWT 인증 + axios 인터셉터 (🔥 핵심)](#2-jwt-인증--axios-인터셉터)
3. [Constants 폴더 패턴 (SSOT)](#3-constants-폴더-패턴)
4. [useAuth 커스텀 훅 + 이벤트 기반 동기화](#4-useauth-커스텀-훅)
5. [React Router state 패턴 (출처 추적)](#5-react-router-state-패턴)
6. [CSS 디자인 시스템 — 로컬 변수 + BEM](#6-css-디자인-시스템)

### Part 2 — 도메인 로직
7. [적합도 점수 알고리즘 (룰 기반 가중치)](#7-적합도-점수-알고리즘)
8. [Fingerprint 중복 제거 (히스토리 dedup)](#8-fingerprint-중복-제거)

### Part 3 — 신뢰성/품질
9. [useEffect 클린업 패턴](#9-useeffect-클린업-패턴)
10. [CSS Animation — Negative Delay 크로스페이드](#10-css-animation--negative-delay-크로스페이드)
11. [JWT 만료 + 401 자동 로그아웃 인터셉터](#11-jwt-만료--401-자동-로그아웃)

### Part 4 — Gemini LLM 통합 (★ 확장됨)
12. [Gemini 파일 캐시 + 다중 모델 자동 우회](#12-gemini-멀티모델-fallback)

### Part 5 — 성능 최적화 (★ NEW)
13. [AI Pipeline 동시성 — OCR + YOLO 병렬 처리](#13-ai-pipeline-동시성)
14. [Rapidfuzz + 길이 인덱스 — 463만 비교 → 0.5초](#14-rapidfuzz-길이-인덱스)
15. [이미지 클라이언트 리사이즈 (Canvas + JPEG)](#15-이미지-클라이언트-리사이즈)
16. [폴링 안정성 — Mutex + Cancellation + Backoff](#16-폴링-안정성)

### Part 6 — DB 운영 자동화 (★ NEW)
17. [DB SSOT 일괄 Lookup + Override 패턴](#17-db-ssot-일괄-lookup)
18. [SQL Seed 스크립트 + npm 자동화](#18-sql-seed-스크립트)

---

<a id="1-아키텍처"></a>
## 1. 프로젝트 아키텍처 한눈에 보기

```
[ 모바일 브라우저 ]
       ↓ (HTTPS)
[ Frontend: React 19 + Vite ]
       ↓ axios
[ Backend: Express + MySQL + JWT ]  ←→  [ AI 서비스: FastAPI + YOLOv8 + CLOVA OCR ]
       ↓                                       ↓
   [ MySQL DB ]                          [ Gemini 2.0/2.5 LLM ]
                                          ↓
                                    [ 파일 영속 캐시 + 모델 cooldown ]
```

### 핵심 설계 원칙
- **모바일 우선** (`max-width: 500px` 컨테이너)
- **단일 진실 공급원 (SSOT)**: 키/URL/색상 + **DB 컬럼**까지 한 곳에서만 관리
- **컴포넌트별 로컬 CSS 변수** (`--bn-*`, `--mp-*`, `--pp-*` 등)
- **이벤트 기반 인증 동기화** (전역 `dispatchEvent`)
- **방어적 비동기** (mutex, cancellation, 자동 우회)

### 통합 실행 — Workspace + Concurrently

```json
"scripts": {
  "ai":   "uvicorn backend.ai.models.main:app --host 127.0.0.1 --port 8001 --reload",
  "back": "npm run dev --workspace=backend",
  "front":"npm run dev --workspace=frontend",
  "dev":  "concurrently -k -s first -n AI,BACK,FRONT -c magenta,cyan,green ..."
}
```

→ `npm run dev` 하나로 3개 서버(Python/Express/Vite) 동시 실행 + 색상 로그 구분.

---

<a id="2-jwt-인증--axios-인터셉터"></a>
## 2. JWT 인증 + axios 인터셉터 🔥

> **이 프로젝트에서 가장 중요한 코드.** 모든 API 요청의 라우팅 / 인증 / 만료 처리가 한곳에서 일어남.

### 📍 위치: `src/api/axiosInstance.js`

```js
api.interceptors.request.use((config) => {
    const isExpressSuncare = EXPRESS_SUNCARE_PATHS.some(p => config.url.startsWith(p));

    if (isExpressSuncare) {
        // 1️⃣ Express 서버 + 사용자 JWT
        config.baseURL = import.meta.env.VITE_API_BASE_URL;
        const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
    } else if (config.url.includes('/suncare') || config.url.includes('/tasks')) {
        // 2️⃣ FastAPI 직접 호출 (내부 토큰)
        config.baseURL = FASTAPI_BASE_URL;
        config.headers.Authorization = `Bearer ${import.meta.env.VITE_INTERNAL_TOKEN}`;
    } else {
        // 3️⃣ 그 외 일반 Express 요청
        ...
    }
    return config;
});
```

**💡 학습 포인트**
- **하나의 axios 인스턴스로 두 백엔드 동시 지원** — URL 패턴으로 자동 라우팅
- 호출자는 `api.get('/suncare/analyses')` 만 쓰면 됨, 토큰 직접 안 만짐

---

<a id="3-constants-폴더-패턴"></a>
## 3. Constants 폴더 패턴 (SSOT)

### 📍 위치: `src/constants/`

```
storageKeys.js     — localStorage 키 + 이벤트 이름
apiPaths.js        — API 베이스 URL, 경로, timeout
timings.js         — setTimeout 지연 시간
externalLinks.js   — 외부 URL 데이터 + URL 빌더 헬퍼
```

```js
// storageKeys.js
export const STORAGE_KEYS = Object.freeze({
    AUTH_TOKEN: 'authToken',
    USER_EMAIL: 'userEmail',
    USER_NICKNAME: 'userNickname',
});

export const AUTH_EVENTS = Object.freeze({
    CHANGE: 'sun-care-auth-change',
});

export const USER_SESSION_KEYS = Object.freeze([...]);
```

**💡 핵심**
- **`Object.freeze()`** — 런타임 수정 차단 (실수 방지)
- 키 이름 변경 시 **한 파일만 수정** → 8곳 자동 반영
- **`USER_SESSION_KEYS`** 처럼 묶음 상수도 만들어 반복 제거

---

<a id="4-useauth-커스텀-훅"></a>
## 4. useAuth 커스텀 훅 + 이벤트 기반 동기화

```js
useEffect(() => {
    const sync = () => {
        setToken(getAuthToken());
        setEmail(getUserEmail() || '');
    };
    sync();

    // 🌟 두 가지 이벤트 모두 청취
    window.addEventListener(AUTH_EVENTS.CHANGE, sync);  // 같은 탭 내 로그인/아웃
    window.addEventListener('storage', sync);            // 다른 탭에서 변경

    return () => {
        window.removeEventListener(AUTH_EVENTS.CHANGE, sync);
        window.removeEventListener('storage', sync);
    };
}, []);
```

**💡 핵심**
- `storage` 이벤트 = 브라우저 native, **다른 탭의 변경 자동 감지**
- `dispatchEvent` = 같은 탭 내 컴포넌트 간 알림
- → 어느 탭에서 로그아웃해도 **모든 화면 즉시 갱신**

---

<a id="5-react-router-state-패턴"></a>
## 5. React Router state 패턴 (출처 추적)

### 📍 MyPage → ProfilePage 흐름

```jsx
// MyPage: 출처 전달
navigate('/profile', { state: { from: '/mypage' } });

// ProfilePage: 출처 받아 닫기 시 복귀
const fromPath = location.state?.from || '/';
const handleClose = () => navigate(fromPath);
```

### 응용: 분석 결과 전달 (stable 디펜던시)

```jsx
// useEffect 의존성에 객체 직접 넣으면 매 렌더링마다 재실행됨!
const newAnalysisTrigger = JSON.stringify(location.state?.newAnalysis);

useEffect(() => {
    if (location.state?.newAnalysis) {
        const newItem = buildNewAnalysisItem(location.state.newAnalysis, userProfile);
        ...
    }
}, [isLoggedIn, newAnalysisTrigger]);  // ← JSON 직렬화로 안정된 디펜던시
```

**💡 트릭**: 객체 참조 비교 대신 **JSON 문자열로 안정화** → 무한 루프 회피.

---

<a id="6-css-디자인-시스템"></a>
## 6. CSS 디자인 시스템 — 로컬 변수 + BEM

### 컴포넌트별 로컬 변수 패턴

```css
/* 부모 + 모든 자식에게 변수 주입 */
.mypage-container,
.mypage-container * {
  --mp-primary: #ff8c00;
  --mp-key-bg: #fffbeb;       /* 핵심 성분 배경 (앰버) */
  --mp-warn-bg: #fef2f2;      /* 주의 성분 배경 (레드) */
  --mp-transition: all 0.2s ease;
}
```

**💡 페이지별 prefix 격리**: `--mp-*` MyPage, `--pp-*` ProfilePage, `--hd-*` HistoryDetail → 변수 충돌 차단.

---

<a id="7-적합도-점수-알고리즘"></a>
## 7. 적합도 점수 알고리즘 (룰 기반 가중치)

### 📍 위치: `src/utils/compatibilityScore.js`

```js
export function calculateCompatibility(detectedIngredients = [], profile = {}) {
    const BASE_SCORE = 70;   // 까다로운 출발점

    // ① 위험 등급 성분 감점
    detectedIngredients.forEach(ing => {
        const grade = Number(ing.ewg_grade) || 0;
        if (grade >= 7)      breakdown.warnDeduction -= 20;
        else if (grade >= 5) breakdown.warnDeduction -= 10;
    });

    // ② 핵심 성분 가점 (최대 +15 상한)
    breakdown.keyBonus = Math.min(keyCount * 3, 15);

    // ③ 기피 성분 매칭 감점 (-25)
    // ④ 피부 타입 보정 / ⑤ 활동 환경 보정

    let score = breakdown.base + ... ;
    score = Math.max(0, Math.min(100, score));   // 0~100 클리핑
    ...
}
```

**💡 학습 포인트**
- `BASE 70` 출발 → 100점 거의 불가능 (인플레이션 방지)
- `Math.min(value, cap)` 으로 가점 상한 → 한 카테고리 독주 방지
- **`Math.max(0, Math.min(100, x))`** → 범위 클리핑 정석
- `breakdown` 객체 반환 → UI에서 "왜 이 점수?" 설명 가능

---

<a id="8-fingerprint-중복-제거"></a>
## 8. Fingerprint 중복 제거 (히스토리 dedup)

```js
const computeFingerprint = (item) => {
    const names = [...(item.keyIng || []), ...(item.warnIng || [])]
        .map(it => typeof it === 'string' ? it : (it?.name || ''))
        .filter(Boolean);
    return names.sort().join('|');
};

const isDuplicateItem = (newItem, existingItems) => {
    if (existingItems.some(it => it.id === newItem.id)) return true;
    const newFp = computeFingerprint(newItem);
    return existingItems.some(it => computeFingerprint(it) === newFp);
};
```

**💡 학습 포인트**
- `.sort().join('|')` = **순서 무관한 시그니처** (정렬 후 합치기)
- 같은 제품 두 번 분석해도 **검출 성분 조합이 같으면 중복** 처리
- 객체/문자열 양쪽 형태 대응 (typeof 분기)

---

<a id="9-useeffect-클린업-패턴"></a>
## 9. useEffect 클린업 패턴

### 패턴 (A): setInterval 정리

```js
const intervalRef = useRef(null);

useEffect(() => {
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
}, []);
```

### 패턴 (B): body class 정리

```js
useEffect(() => {
    document.body.classList.add('survey-mode');
    return () => document.body.classList.remove('survey-mode');
}, []);
```

### 패턴 (C): html/body overflow 일시 차단

```js
useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
        document.documentElement.style.overflow = prevHtml;
        document.body.style.overflow = prevBody;
    };
}, []);
```

**💡 핵심**: **이전 값 백업 → 복원** 패턴으로 다른 페이지 영향 차단.

---

<a id="10-css-animation--negative-delay-크로스페이드"></a>
## 10. CSS Animation — Negative Delay 크로스페이드

```css
@keyframes smoothFade {
  0%,  45%  { opacity: 0; }
  50%, 95%  { opacity: 1; }
  100%      { opacity: 0; }
}

.hero-bg .bg-image.woman { animation-delay: -5s; }  /* 사이클 절반 시점부터 시작 */
.hero-bg .bg-image.man   { animation-delay:  0s; }
```

### 타임라인

```
t=0~4.5s:   woman: 1   man: 0    → woman 보임
t=4.5~5s:   woman: 1→0 man: 0→1  → 크로스페이드 ✅
t=5~9.5s:   woman: 0   man: 1    → man 보임
t=9.5~10s:  woman: 0→1 man: 1→0  → 크로스페이드 ✅
```

**💡 핵심**: **`animation-delay: -5s`** = "이미 5초 진행된 상태에서 시작" → 두 이미지가 정확히 cross-fade.

---

<a id="11-jwt-만료--401-자동-로그아웃"></a>
## 11. JWT 만료 + 401 자동 로그아웃 인터셉터

### 백엔드 — 만료 vs 위변조 분기 (`authMiddleware.js`)

```js
} catch (err) {
    if (err.name === "TokenExpiredError") {
        console.warn(`[Auth] 토큰 만료 (expiredAt=${err.expiredAt})`);
        return res.status(401).json({ code: "TOKEN_EXPIRED", ... });
    }
    if (err.name === "JsonWebTokenError") {
        console.warn(`[Auth] 토큰 위변조: ${err.message}`);
        return res.status(401).json({ code: "TOKEN_INVALID", ... });
    }
    console.error("JWT 인증 에러:", err);  // 그 외만 풀 스택
    return res.status(401).json({ message: "인증 처리 중 오류" });
}
```

### 프론트엔드 — 다발 호출 시 1회만 처리

```js
let isHandlingAuthFailure = false;   // 클로저 플래그

const handleAuthFailure = (reason) => {
    if (isHandlingAuthFailure) return;
    isHandlingAuthFailure = true;

    USER_SESSION_KEYS.forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new Event(AUTH_EVENTS.CHANGE));

    const currentPath = window.location.pathname + window.location.search;
    if (!AUTH_PAGE_PATHS.some(p => window.location.pathname.startsWith(p))) {
        window.location.href = `${LOGIN_PATH}?redirect=${encodeURIComponent(currentPath)}&reason=expired`;
    }

    setTimeout(() => { isHandlingAuthFailure = false; }, AUTH_FAILURE_RESET_MS);
};
```

**💡 학습 포인트**
- **`err.name`** 으로 JWT 에러 종류 정확히 분기 (백엔드 로그 노이즈 ↓)
- **클로저 플래그**로 페이지 진입 시 동시 다발 401 호출 모두 → 단 1회 처리
- **`window.location.href`** (React Router navigate 아님) — 강제 리로드로 모든 state 초기화
- **`?redirect=원래경로`** → 로그인 후 원래 페이지로 복귀

---

<a id="12-gemini-멀티모델-fallback"></a>
## 12. Gemini 파일 캐시 + 다중 모델 자동 우회 ★ 확장

### (A) 파일 영속 캐시 — 비용 0 + 50ms 응답

```js
const CACHE_FILE = path.join(__dirname, '..', '..', 'cache', 'ai_reason_cache.json');
const aiReasonCache = new Map();

(function loadCacheFromDisk() {
    if (fs.existsSync(CACHE_FILE)) {
        const obj = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        for (const [k, v] of Object.entries(obj)) aiReasonCache.set(k, v);
    }
})();

// debounced 디스크 저장
function scheduleSaveToDisk() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(aiReasonCache)));
    }, SAVE_DEBOUNCE_MS);
}
```

**💡 핵심**: **서버 재시작 후에도 캐시 유지** → DB 부담 0 + Gemini 호출 비용 0.

### (B) 멀티 모델 Fallback Chain (★ NEW)

```js
const DEFAULT_MODEL_CANDIDATES = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite',
];

const modelCooldownUntil = new Map();   // 모델별 cooldown 추적

function extractRetryDelaySeconds(errorBody) {
    const details = errorBody?.error?.details;
    for (const d of details || []) {
        if (d['@type']?.includes('RetryInfo') && d.retryDelay) {
            return Math.ceil(parseFloat(String(d.retryDelay).replace('s', '')));
        }
    }
    return null;
}

// 모델 체인 순회: 429 받으면 cooldown 등록 + 다음 모델 즉시 시도
for (const model of MODEL_CHAIN) {
    if (Date.now() < (modelCooldownUntil.get(model) || 0)) continue;

    try {
        response = await callGeminiWithModel(model);
        console.log(`[Gemini] ✅ ${model} 호출 성공`);
        break;
    } catch (err) {
        if (err.response?.status === 429) {
            const retrySec = extractRetryDelaySeconds(err.response.data) || 60;
            modelCooldownUntil.set(model, Date.now() + retrySec * 1000);
            continue;   // 즉시 다음 모델로
        }
        if (err.response?.status === 404) continue;   // 폐기 모델
        if (isTransient5xx) { /* 같은 모델 1초 재시도 */ }
        throw err;
    }
}
```

**💡 학습 포인트**
- Google이 응답 헤더에 알려준 **`retryDelay`** 추출 → 정확한 cooldown 등록
- **모델 간 한도 풀이 독립** → 한 모델 막혀도 다른 모델로 자동 우회
- **사용자는 알아채지 못함** — 응답이 자연스럽게 나옴
- 효과: 무료 한도 1500/일 × 4 모델 ≈ **6,000회/일 사용 가능**

### (C) thinking 모드 비활성 — gemini-2.5 토큰 절약

```js
generationConfig: {
    thinkingConfig: { thinkingBudget: 0 },   // 보이지 않는 thinking 토큰 차단
    maxOutputTokens: 1500,
}
```

→ gemini-2.5의 thinking 모드가 켜져있으면 **응답 토큰을 다 thinking에 쓰고 출력 잘림** → 0으로 비활성.

---

<a id="13-ai-pipeline-동시성"></a>
## 13. AI Pipeline 동시성 — OCR + YOLO 병렬 ★ NEW

> 외부 API와 로컬 추론은 **서로 간섭 안 함** → 병렬 실행으로 2배 빠르게.

### 📍 위치: `backend/ai/models/pipeline.py`

```python
# Before — 순차 실행 (총 ~5초)
ocr_fields = await OCR_API()      # 3초 대기
boxes = await YOLO()              # 2초 대기

# After — 병렬 실행 (총 ~3초, 둘 중 긴 시간만)
ocr_task = asyncio.create_task(
    asyncio.wait_for(
        to_thread.run_sync(ocr_service.request_full_image_ocr, image),
        timeout=30.0
    )
)

async with lock:               # YOLO 는 lock 필요 (GPU/CPU 자원)
    boxes = await asyncio.wait_for(
        to_thread.run_sync(ocr_service.detect_boxes, image),
        timeout=60.0
    )

ocr_fields = await ocr_task   # OCR 결과 대기 (이미 끝났을 가능성 큼)
```

**💡 핵심**
- **OCR**: CLOVA 외부 API 호출 (네트워크 wait) → lock 불필요
- **YOLO**: 로컬 추론 (GPU/CPU) → lock 필요
- 둘이 **자원 충돌 안 함** → 안전한 병렬화
- `to_thread.run_sync` = 동기 함수를 별도 스레드에서 실행 (블로킹 회피)

### 단계별 시간 측정 로깅

```python
t = time.time()
image = await ocr_service.preprocess_image_bytes(...)
logger.info(f">>> [TIMING] preprocess: {time.time() - t:.2f}s")

t = time.time()
ocr_task = asyncio.create_task(...)
boxes = await ...
ocr_fields = await ocr_task
logger.info(f">>> [TIMING] OCR+YOLO 병렬: {time.time() - t:.2f}s")

logger.info(f">>> [TIMING] 🎯 TOTAL: {time.time() - task_start:.2f}s")
```

→ **병목 위치를 정확히 측정** → 추가 최적화 우선순위 결정.

---

<a id="14-rapidfuzz-길이-인덱스"></a>
## 14. Rapidfuzz + 길이 인덱스 ★ NEW

> 663 segments × 7,000 ingredients = **463만 비교**를 0.5초에 처리.

### 📍 위치: `backend/ai/models/ingredient_matcher.py`

### 1) 사전 인덱스 생성 (서버 시작 시 1회)

```python
async def initialize(self):
    self.ingredient_map = await self._load_ingredients()
    self.ingredient_names = list(self.ingredient_map.keys())

    # 🌟 길이별 인덱스: { 길이: [성분명, ...] }
    self.length_index = defaultdict(list)
    for name in self.ingredient_names:
        self.length_index[len(name)].append(name)
```

### 2) 길이 필터 + score_cutoff

```python
LEN_RATIO_LOW = 0.5     # query 길이의 50% 미만 후보 제외
LEN_RATIO_HIGH = 2.0    # 200% 초과 제외
MATCH_SCORE_CUTOFF = 80

def match_ingredients(self, extracted_texts: list):
    # 중복 query 제거 + 너무 짧은 텍스트 필터
    seen_queries = set()
    unique_queries = []
    for raw_text in extracted_texts:
        text_val = self.clean_text(raw_text)
        if not text_val or len(text_val) < 2: continue
        if text_val in seen_queries: continue
        seen_queries.add(text_val)
        unique_queries.append((raw_text, text_val))

    matched_names_set = set()
    matched_results = []

    for raw_text, text_val in unique_queries:
        q_len = len(text_val)
        # 🌟 길이 인덱스로 후보군 추리기 (7000 → 평균 500~1000)
        candidates = []
        for l in range(max(2, int(q_len * 0.5)), int(q_len * 2.0) + 1):
            candidates.extend(self.length_index.get(l, []))

        if not candidates: continue

        result = process.extractOne(
            text_val,
            candidates,
            scorer=fuzz.partial_ratio,     # WRatio 보다 5~10배 빠름
            score_cutoff=MATCH_SCORE_CUTOFF # 점수 미달 시 일찍 종료
        )
        if not result: continue

        best_match_name = result[0]
        if best_match_name in matched_names_set: continue
        matched_names_set.add(best_match_name)

        matched_data = self.ingredient_map[best_match_name].copy()
        matched_results.append(matched_data)

    # 🌟 결과 정렬 → 매번 같은 input 에 같은 output 보장
    matched_results.sort(key=lambda x: (
        x.get('ewg_grade') if x.get('ewg_grade') is not None else 99,
        x.get('ingre_name', '')
    ))
    return matched_results
```

**💡 학습 포인트**
- **fuzz.WRatio → fuzz.partial_ratio**: 5~10배 빠름, 정확도 거의 동일
- **`score_cutoff=80`**: rapidfuzz가 점수 미달 시 **조기 종료**
- **길이 인덱스**: 7,000 후보 → 평균 500~1,000개 (**약 1/10**)
- **`set()` 중복 query 제거**: 같은 텍스트 두 번 호출 회피
- **결과 정렬**: 매번 같은 input → 같은 output (결정론적 TOP 3 보장)
- 효과: **4.3초 → 0.5초** (8배 이상 단축)

---

<a id="15-이미지-클라이언트-리사이즈"></a>
## 15. 이미지 클라이언트 리사이즈 (Canvas + JPEG) ★ NEW

> 모바일 카메라 5~10MB 사진 → 500KB 미만으로 압축하여 업로드 시간 90% 단축.

### 📍 위치: `frontend/src/utils/imageResize.js`

```js
const MAX_DIMENSION = 1024;       // YOLO 입력은 어차피 640 → 1024 가 손실 없는 마지노선
const JPEG_QUALITY = 0.78;
const RESIZE_THRESHOLD_BYTES = 500 * 1024;

export async function resizeImage(file) {
    if (!file.type.startsWith('image/')) return file;
    if (file.size < RESIZE_THRESHOLD_BYTES) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const { width: w, height: h } = img;
            if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) {
                resolve(file);
                return;
            }

            // 비율 유지 축소 계산
            const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
            const newW = Math.round(w * ratio);
            const newH = Math.round(h * ratio);

            // Canvas 로 리샘플링
            const canvas = document.createElement('canvas');
            canvas.width = newW;
            canvas.height = newH;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, newW, newH);

            canvas.toBlob(
                (blob) => {
                    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
                    resolve(new File([blob], newName, { type: 'image/jpeg' }));
                },
                'image/jpeg',
                JPEG_QUALITY
            );
        };

        img.onerror = () => reject(new Error('이미지 로드 실패'));
        img.src = objectUrl;
    });
}
```

**💡 학습 포인트**
- **`URL.createObjectURL` + `revokeObjectURL`**: 메모리 누수 회피
- **비율 유지 축소**: `Math.min(MAX/w, MAX/h)` 로 더 긴 변 기준 축소율 계산
- **`imageSmoothingQuality: 'high'`**: 다운샘플링 품질 ↑
- **`canvas.toBlob(callback, mime, quality)`**: 비동기 인코딩
- 효과: 모바일 5MB → 500KB, **업로드 90% 단축**

---

<a id="16-폴링-안정성"></a>
## 16. 폴링 안정성 — Mutex + Cancellation + Backoff ★ NEW

> `setInterval` 비동기 폴링의 가장 흔한 함정들을 모두 회피.

### 📍 위치: `frontend/src/pages/ScanPage.jsx`

```js
let isCancelled = false;    // stop 후 진행 중인 콜백 즉시 무시
let isFetching = false;     // mutex — 이전 호출 진행 중이면 새 호출 skip
let consecutiveErrors = 0;  // 연속 에러 카운터
const startedAt = Date.now();

const stopAllTimers = () => {
    isCancelled = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
};

const pollOnce = async () => {
    if (isCancelled) return;

    // ① 최대 시간 가드 (1분 초과 시 강제 종료)
    if (Date.now() - startedAt > POLLING_MAX_DURATION_MS) {
        stopAllTimers();
        setError(ERROR_TIMEOUT);
        return;
    }

    // ② 이미 진행 중인 fetch 있으면 skip (동시 다발 방지)
    if (isFetching) return;
    isFetching = true;

    try {
        const res = await getTaskStatus(task_id);
        if (isCancelled) return;
        consecutiveErrors = 0;   // 성공 시 카운터 리셋

        if (res.status === STATUS_COMPLETED) {
            stopAllTimers();
            navigate('/mypage', { state: { newAnalysis: res.result } });
        }
    } catch (err) {
        if (isCancelled) return;
        consecutiveErrors += 1;

        // ③ 연속 N회 실패 시 중단 + 사용자 메시지
        if (consecutiveErrors >= POLLING_MAX_CONSECUTIVE_ERRORS) {
            stopAllTimers();
            setError(isNetworkError ? ERROR_AI_SERVER_DOWN : ERROR_API);
        }
    } finally {
        isFetching = false;
    }
};

// 🌟 1차 호출은 즉시 (setInterval 의 1초 지연 절약)
pollOnce();
intervalRef.current = setInterval(pollOnce, POLLING_INTERVAL_MS);
```

**💡 학습 포인트** — 4가지 안전망

| 가드 | 역할 |
|---|---|
| **`isCancelled`** | stop 이후 진행 중이던 비동기 콜백을 즉시 무시 (좀비 처리 방지) |
| **`isFetching` mutex** | setInterval이 1초마다 새 콜백 시작해도 **동시 1개만** 실행 |
| **`consecutiveErrors`** | N회 연속 실패 시 자동 중단 → 무한 폴링 회피 |
| **`POLLING_MAX_DURATION_MS`** | 절대 시간 가드 → 1분 넘으면 강제 종료 |
| **즉시 첫 호출** | `setInterval(..., 1000)` 의 1초 지연 절약 → 빠른 task 즉시 감지 |

---

<a id="17-db-ssot-일괄-lookup"></a>
## 17. DB SSOT 일괄 Lookup + Override 패턴 ★ NEW

> DB 컬럼이 진실의 원천. 기존 캐시된 값은 **응답 시점에 최신 DB 값으로 덮어쓰기**.

### 문제 상황
- 분석 시점에 `detected_ingredients[].skin_warning` 이 `tb_analysis.analysis_result` JSON에 박힘
- DB의 `tb_ingredient.skin_warning` 컬럼을 나중에 업데이트해도 옛 분석은 옛 값 그대로
- → **응답 만들 때마다** 최신 DB 값으로 override

### 📍 위치: `backend/src/controllers/suncareController.js`

```js
// 🌟 모든 분석의 detected 성분명 수집 (5건 × 평균 70개 = 약 350개)
const allDetectedNames = new Set();
for (const row of rows) {
    const p = JSON.parse(row.analysis_result);
    (p?.ingredients?.detected_ingredients || []).forEach(i => {
        if (i.ingre_name) allDetectedNames.add(i.ingre_name);
    });
}

// 🌟 tb_ingredient 한 번의 IN 쿼리로 일괄 조회 (N+1 회피)
const freshIngredientMap = new Map();
if (allDetectedNames.size > 0) {
    const namesArr = [...allDetectedNames];
    const placeholders = namesArr.map(() => '?').join(',');
    const [freshRows] = await db.execute(
        `SELECT ingre_name, ewg_grade, skin_warning
           FROM tb_ingredient
          WHERE ingre_name IN (${placeholders})`,
        namesArr
    );
    for (const r of freshRows) {
        freshIngredientMap.set(r.ingre_name, {
            ewg_grade: r.ewg_grade,
            skin_warning: r.skin_warning || ''
        });
    }
}

// 🌟 각 분석에서 최신 값으로 override
detectedIngredients = detectedIngredients.map(i => {
    const fresh = freshIngredientMap.get(i.ingre_name);
    if (!fresh) return i;
    return {
        ...i,
        ewg_grade: fresh.ewg_grade != null ? fresh.ewg_grade : i.ewg_grade,
        skin_warning: fresh.skin_warning || i.skin_warning || ''
    };
});
```

**💡 학습 포인트**
- **N+1 문제 회피**: 분석 5개 × 성분 70개 = 350번 SELECT 대신 **IN 절 1번**
- `Set` 으로 unique names 모은 뒤 일괄 조회 → 동일 성분 중복 조회 방지
- **호환 fallback**: DB에 없는 성분은 캐시된 옛 값 그대로 사용
- SQL `UPDATE` 한 번 실행하면 → **모든 옛 분석에 즉시 반영**
- 효과: 하드코딩 매핑 제거 + 분석 N개에 새 정보 자동 전파

---

<a id="18-sql-seed-스크립트"></a>
## 18. SQL Seed 스크립트 + npm 자동화 ★ NEW

> 도메인 데이터(성분 효능 설명)를 코드 한 번으로 일괄 업데이트하는 운영 스크립트.

### 📍 위치: `backend/src/scripts/updateIngredientWarnings.js`

```js
// 1. SQL 파일을 파싱 가능한 statement 배열로 변환
function parseStatements(sqlText) {
    const cleaned = sqlText
        .split('\n')
        .map(line => {
            const idx = line.indexOf('--');
            return idx >= 0 ? line.slice(0, idx) : line;    // 인라인 -- 주석 제거
        })
        .join('\n');

    const noBlockComments = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');  // /* */ 제거

    return noBlockComments
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

// 2. 각 statement 종류별 처리
for (const stmt of statements) {
    const upper = stmt.toUpperCase();

    if (upper.startsWith('UPDATE')) {
        const [result] = await pool.query(stmt);
        const affected = result.affectedRows || 0;
        totalUpdated += affected;
        console.log(`   ✓ ${affected} rows  |  ${stmt.slice(0, 80)}...`);
    }
    else if (upper.startsWith('SELECT')) {
        const [rows] = await pool.query(stmt);
        console.log(`   📋 확인용: ${rows.length}개`);
    }
    // START TRANSACTION / COMMIT 자동 처리
}
```

### `package.json`

```json
"scripts": {
    "db:seed-warnings": "node src/scripts/updateIngredientWarnings.js"
}
```

```bash
npm run db:seed-warnings
```

**💡 학습 포인트**
- **트랜잭션 (START / COMMIT)**: 중간 실패 시 전체 롤백
- **매칭 안 되는 `ingre_name` 자동 무시**: `WHERE IN` 으로 영향 0
- **마지막 SELECT 출력**: 업데이트 후 결과 자동 확인
- **UPDATE만 사용**: 데이터 손실 위험 0 (INSERT/DELETE 없음)
- 효과: 도메인 지식 업데이트가 **코드 변경 + 배포 없이도** 가능

---

## 🎯 학습 우선순위 추천

### Part 1 (기초 — 일주일)
1. **§2 JWT 인터셉터** — 모든 API의 토대
2. **§3 Constants SSOT** — 코드 변경 영향 범위
3. **§4 useAuth** — React 커스텀 훅 정석
4. **§5 Router state** — SPA 데이터 흐름

### Part 2 (실전 — 일주일)
5. **§9 useEffect 클린업** — React 함정 회피
6. **§11 JWT 자동 로그아웃** — 클로저 패턴
7. **§7 적합도 알고리즘** — 도메인 로직
8. **§6 CSS 디자인 시스템** — 유지보수 가능 스타일

### Part 3 (심화 — 일주일)
9. **§12 Gemini 멀티 모델 Fallback** — 외부 의존성 안전망
10. **§13 AI 동시성** — asyncio 병렬
11. **§14 Rapidfuzz 인덱스** — 알고리즘 최적화
12. **§16 폴링 안정성** — 비동기 함정 4가지

### Part 4 (운영 — 일주일)
13. **§17 DB SSOT Lookup** — N+1 회피 + 자동 전파
14. **§18 SQL Seed 자동화** — 도메인 데이터 운영
15. **§15 이미지 리사이즈** — 클라이언트 최적화
16. **§10 CSS Animation** — 시각 마무리

---

## 🔑 외워두면 좋은 패턴 한 줄 요약 (확장됨)

| 카테고리 | 패턴 | 한 줄 요약 |
|---|---|---|
| **인증** | axios 인터셉터 | 토큰 자동 첨부 + 401 자동 로그아웃 |
| | `storage` 이벤트 | 다른 탭의 변경 자동 감지 |
| | `dispatchEvent` | 같은 탭 내 컴포넌트 알림 |
| | 클로저 플래그 | 다발 호출 중 1회만 처리 |
| **상수화** | `Object.freeze` | 런타임 수정 차단 |
| | `JSON.stringify` 디펜던시 | useEffect 객체 무한 루프 회피 |
| **라우팅** | `navigate(p, { state })` | URL에 안 보이는 데이터 전달 |
| | `location.state?.from \|\| '/'` | 출처 추적 + 안전 fallback |
| **CSS** | `--prefix-* 로컬 변수` | 페이지별 디자인 토큰 격리 |
| | `animation-delay: -Ns` | 사이클 중간부터 시작 (크로스페이드) |
| | `inset: 0` | top/right/bottom/left 단축 |
| **React** | useEffect 클린업 | interval/listener/class 정리 |
| | `useRef` 타이머 보관 | re-render 영향 안 받게 |
| | 이전 값 백업/복원 | body class/overflow 안전 변경 |
| **알고리즘** | `Math.max(0, Math.min(100, x))` | 범위 클리핑 |
| | `.sort().join('\|')` | 순서 무관 시그니처 |
| | 길이 인덱스 사전 빌드 | O(N) 검색 → O(N/k) |
| | `score_cutoff` 조기 종료 | rapidfuzz 가속 |
| **비동기** | `asyncio.create_task` | 백그라운드 진행 |
| | mutex 플래그 | 동시 다발 호출 차단 |
| | cancellation 플래그 | 좀비 콜백 무시 |
| | 즉시 첫 호출 | setInterval 첫 지연 절약 |
| **LLM** | `thinkingBudget: 0` | thinking 토큰 절약 |
| | 파일 영속 캐시 | 비용 0 + 50ms |
| | 모델 cooldown Map | 다중 모델 우회 |
| | `retryDelay` 추출 | Google이 알려준 정확한 대기 |
| **DB** | IN 쿼리 일괄 조회 | N+1 회피 |
| | 응답 시점 override | DB 변경 즉시 전파 |
| | UPDATE 트랜잭션 | 안전한 일괄 변경 |
| **이미지** | Canvas + toBlob | 클라이언트 압축 |
| | `URL.revokeObjectURL` | 메모리 누수 회피 |

---

## 📁 코드 위치 빠른 참조 (확장됨)

```
src/
├── api/
│   ├── axiosInstance.js         ⭐ §2 §11 인증 인터셉터
│   ├── analysisApi.js           §16 폴링 + §15 리사이즈 호출
│   └── ...
├── constants/                    ⭐ §3 SSOT 패턴
│   ├── storageKeys.js
│   ├── apiPaths.js
│   ├── timings.js
│   └── externalLinks.js
├── hooks/
│   └── useAuth.js               ⭐ §4 커스텀 훅
├── utils/
│   ├── compatibilityScore.js    ⭐ §7 적합도 알고리즘
│   ├── imageResize.js           ⭐ §15 이미지 리사이즈
│   └── ...
├── pages/
│   ├── MyPage.jsx               ⭐ §5 §8 state + fingerprint
│   ├── ProfilePage.jsx          ⭐ §5 §9 from + body class
│   ├── ScanPage.jsx             ⭐ §16 폴링 안정성
│   ├── HistoryDetailPage.jsx    ⭐ §12 Gemini 호출
│   ├── HomePage.css             ⭐ §10 크로스페이드
│   └── ...
└── ...

backend/
├── src/
│   ├── controllers/
│   │   └── suncareController.js ⭐ §17 DB SSOT lookup
│   ├── services/
│   │   └── geminiService.js     ⭐ §12 멀티 모델 Fallback
│   ├── scripts/
│   │   └── updateIngredientWarnings.js ⭐ §18 SQL Seed
│   ├── db/
│   │   └── update_ingredient_warnings.sql ⭐ §18 SQL
│   ├── middlewares/
│   │   └── authMiddleware.js    ⭐ §11 JWT 에러 분기
│   └── ...
└── ai/
    └── models/
        ├── pipeline.py          ⭐ §13 OCR+YOLO 병렬
        ├── ingredient_matcher.py ⭐ §14 길이 인덱스
        └── ocr_service.py
```

---

## 🆕 이번 버전(v2)에서 추가된 핵심 (총 7개)

1. **§11 JWT 만료 분기 처리** — 백엔드 로그 노이즈 감소
2. **§12 Gemini 멀티 모델 Fallback** — 무료 한도 6,000회/일
3. **§13 OCR + YOLO 병렬** — Pipeline 시간 단축
4. **§14 Rapidfuzz 길이 인덱스** — 매칭 4.3초 → 0.5초
5. **§15 클라이언트 이미지 리사이즈** — 업로드 90% 단축
6. **§16 폴링 4중 안전망** — Mutex / Cancel / Counter / Time guard
7. **§17 DB SSOT 일괄 Lookup** — 캐시 우회 + 즉시 전파

### 성능 변화 누적 (분석 1회 기준)

| 단계 | v1 (초기) | v2 (현재) |
|---|---|---|
| 클라이언트 이미지 처리 | 0.5초 | 0.2초 |
| 업로드 | 1.5초 | 0.3초 |
| Pipeline 전체 | 9~12초 | 4~5초 |
| └ OCR | 5~8초 | 3~4초 (병렬) |
| └ Matching | 4~5초 | **0.3초** |
| 폴링 첫 호출 지연 | 1초 | **즉시** |
| **TOTAL** | **20~25초** | **5~7초** |

---

## 📝 추가 학습 자료

- **React 공식 docs**: https://react.dev
- **Vite 가이드**: https://vitejs.dev/guide
- **MDN CSS Animation**: https://developer.mozilla.org/ko/docs/Web/CSS/CSS_animations
- **JWT 이해**: https://jwt.io/introduction
- **BEM 네이밍**: https://getbem.com
- **rapidfuzz 문서**: https://rapidfuzz.github.io/RapidFuzz/
- **Python asyncio**: https://docs.python.org/3/library/asyncio.html
- **Gemini API**: https://ai.google.dev/gemini-api/docs

— 끝 —
