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
  const expressSuncarePaths = ['/suncare/upload', '/suncare/analyses', '/suncare/callbacks', '/suncare/results', '/suncare/ai-reason', '/suncare/recommendations'];
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

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error("403 Forbidden: 토큰이 일치하지 않거나 서버 설정 문제입니다.");
    }
    return Promise.reject(error);
  }
)

export default api;