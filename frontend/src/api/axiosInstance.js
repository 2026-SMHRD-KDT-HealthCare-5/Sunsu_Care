//  모든 API가 공유할 axios 인스턴스. baseURL, 타임아웃, 인증 토큰 자동 첨부.

// src/api/axiosInsta3ios'
import axios from 'axios'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 요청 인터셉터: 토큰을 모든 요청에 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 인터셉터: 공통 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401: 토큰 만료/무효 → 추후 자동 로그아웃 로직
    if (error.response?.status === 401) {
      // localStorage.removeItem('authToken')
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// 백엔드 URL을 환경에 따라 다르게 쓰고 싶으면 frontend/ 루트에 .env 파일 생성
// : VITE_API_BASE_URL=http://localhost:8000/api