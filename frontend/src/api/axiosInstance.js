// frontend/src/api/axiosInstance.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  // 1. AI 서버 분석 관련 요청 분기
  if (config.url.includes('/suncare') || config.url.includes('/tasks')) {
    config.baseURL = 'http://localhost:8001/api/v1'; 
    
    const token = import.meta.env.VITE_INTERNAL_TOKEN;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.error(".env 파일에서 VITE_INTERNAL_TOKEN을 찾을 수 없습니다.");
    }
  } 
  // 2. 일반 백엔드(Node.js) 요청
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