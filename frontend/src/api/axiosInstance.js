// frontend/src/api/axiosInstance.js
import axios from 'axios';
import {
    STORAGE_KEYS,
    AUTH_EVENTS,
    USER_SESSION_KEYS,
} from '../constants/storageKeys';
import {
    FASTAPI_BASE_URL,
    EXPRESS_SUNCARE_PATHS,
    API_TIMEOUT_MS,
    LOGIN_PATH,
    AUTH_PAGE_PATHS,
} from '../constants/apiPaths';
import { AUTH_FAILURE_RESET_MS } from '../constants/timings';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: API_TIMEOUT_MS,
});

api.interceptors.request.use((config) => {
    const isExpressSuncare = EXPRESS_SUNCARE_PATHS.some(p => config.url.startsWith(p));

    if (isExpressSuncare) {
        // 1. Express 서버 + 사용자 JWT 토큰
        config.baseURL = import.meta.env.VITE_API_BASE_URL;
        const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
    } else if (config.url.includes('/suncare') || config.url.includes('/tasks')) {
        // 2. FastAPI 직접 호출 (내부 토큰)
        config.baseURL = FASTAPI_BASE_URL;
        config.headers.Authorization = `Bearer ${import.meta.env.VITE_INTERNAL_TOKEN}`;
    } else {
        // 3. 그 외 일반 Express 서버용 요청
        config.baseURL = import.meta.env.VITE_API_BASE_URL;
        const authToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
    }
    return config;
}, (error) => Promise.reject(error));

// 🌟 401 자동 로그아웃 중복 방지 플래그 (동시 호출 다발 시 한 번만 처리)
let isHandlingAuthFailure = false;

const handleAuthFailure = (reason) => {
    if (isHandlingAuthFailure) return;
    isHandlingAuthFailure = true;

    console.warn(`[Auth] 자동 로그아웃: ${reason}`);

    // 1. 사용자 세션 키 클리어
    USER_SESSION_KEYS.forEach(key => localStorage.removeItem(key));

    // 2. useAuth 동기화 이벤트 발송
    window.dispatchEvent(new Event(AUTH_EVENTS.CHANGE));

    // 3. 로그인 페이지로 리다이렉트 (현재 페이지 redirect 보존)
    const currentPath = window.location.pathname + window.location.search;
    const isAlreadyAuthPage = AUTH_PAGE_PATHS.some(p => window.location.pathname.startsWith(p));

    if (!isAlreadyAuthPage) {
        window.location.href = `${LOGIN_PATH}?redirect=${encodeURIComponent(currentPath)}&reason=expired`;
    }

    // 다음 tick 에 플래그 해제 (페이지 이동 전 다발 호출만 차단)
    setTimeout(() => { isHandlingAuthFailure = false; }, AUTH_FAILURE_RESET_MS);
};

// 응답 인터셉터
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const code = error.response?.data?.code;

        // 🌟 401 (토큰 만료/누락/위변조) → 자동 로그아웃
        if (status === 401) {
            handleAuthFailure(code || 'UNAUTHORIZED');
        } else if (status === 403) {
            console.warn("[Auth] 403 Forbidden: 권한 부족 또는 서버 설정 문제");
        }

        return Promise.reject(error);
    }
);

export default api;
