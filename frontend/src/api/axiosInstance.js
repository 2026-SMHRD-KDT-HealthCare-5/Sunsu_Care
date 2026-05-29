// frontend/src/api/axiosInstance.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  // 1. Express(일반) 서버로 보내야 하는 suncare 경로들 (DB 접근 필요한 것들)
  // - /suncare/upload : 이미지 업로드 + tb_upload 저장
  // - /suncare/analyses : 사용자 분석 히스토리 조회 (JWT 필요)
  // - /suncare/callbacks : FastAPI 콜백 수신
  // - /suncare/results : 분석 결과 조회
  const expressSuncarePaths = ['/suncare/upload', '/suncare/analyses', '/suncare/callbacks', '/suncare/results', '/suncare/ai-reason', '/suncare/recommendations', '/suncare/analyses/'];
  const isExpressSuncare = expressSuncarePaths.some(p => config.url.startsWith(p));

  if (isExpressSuncare) {
    // Express 서버 + 사용자 JWT 토큰
    config.baseURL = import.meta.env.VITE_API_BASE_URL;
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
  } else if (config.url.includes('/suncare') || config.url.includes('/tasks')) {
    // 2. 그 외 suncare/tasks 경로는 FastAPI 직접 호출 (내부 토큰)
    config.baseURL = 'http://127.0.0.1:8001/api/v1';
    config.headers.Authorization = `Bearer ${import.meta.env.VITE_INTERNAL_TOKEN}`;
  } else {
    // 3. 그 외 일반 Express 서버용 요청
    config.baseURL = import.meta.env.VITE_API_BASE_URL;
    const authToken = localStorage.getItem('authToken');
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

  // 1. 로컬 토큰/세션 클리어
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userNickname');

  // 2. useAuth 동기화 이벤트 발송 (마이페이지/사이드메뉴 등 즉시 갱신)
  window.dispatchEvent(new Event('sun-care-auth-change'));

  // 3. 로그인 페이지로 리다이렉트 (현재 페이지 redirect 보존)
  const currentPath = window.location.pathname + window.location.search;
  const isAlreadyAuthPage = ['/login', '/signup'].some(p => window.location.pathname.startsWith(p));

  if (!isAlreadyAuthPage) {
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=expired`;
  }

  // 다음 tick 에 플래그 해제 (페이지 이동 전 다발 호출만 차단)
  setTimeout(() => { isHandlingAuthFailure = false; }, 1000);
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
)

export default api;