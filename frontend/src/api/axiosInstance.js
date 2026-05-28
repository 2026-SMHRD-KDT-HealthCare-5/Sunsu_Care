// frontend/src/api/axiosInstance.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  // 1. AI 서버용 요청 (경로에 suncare나 tasks가 포함될 때)
  if (config.url.includes('/suncare') || config.url.includes('/tasks')) {
    config.baseURL = 'http://localhost:8001/api/v1'; // 포트를 8001로 고정
    config.headers.Authorization = `Bearer ${import.meta.env.VITE_INTERNAL_TOKEN}`;
  } 
  // 2. 일반 서버용 요청
  else {
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