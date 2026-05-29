// ==========================================================================
//  API 경로 + 외부 서비스 URL 중앙 관리
//  - 베이스 URL: 환경변수 (VITE_API_BASE_URL, VITE_FASTAPI_URL) 우선
//  - 경로: 상수로 분리 (오타 방지 + IDE 자동완성)
// ==========================================================================

// 🌟 FastAPI (AI 서비스) 직접 호출 베이스 URL
//    환경변수 VITE_FASTAPI_URL 우선, 없으면 로컬 개발 default
export const FASTAPI_BASE_URL =
    import.meta.env.VITE_FASTAPI_URL || 'http://127.0.0.1:8001/api/v1';

// 🌟 Express(일반) 서버로 라우팅되는 suncare 경로들 (JWT 필요)
export const EXPRESS_SUNCARE_PATHS = Object.freeze([
    '/suncare/upload',
    '/suncare/analyses',
    '/suncare/callbacks',
    '/suncare/results',
    '/suncare/ai-reason',
    '/suncare/recommendations',
    '/suncare/analyses/',   // detail (with id)
]);

// 🌟 axios 공통 설정
export const API_TIMEOUT_MS = 10_000;

// 🌟 인증/리다이렉트
export const LOGIN_PATH = '/login';
export const SIGNUP_PATH = '/signup';
export const AUTH_PAGE_PATHS = Object.freeze([LOGIN_PATH, SIGNUP_PATH]);
