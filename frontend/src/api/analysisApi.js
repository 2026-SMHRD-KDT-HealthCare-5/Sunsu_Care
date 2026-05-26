// frontend/src/api/analysisApi.js
import api from './axiosInstance';
import { getProfile } from '../utils/storage';

// 1. 제품 사진 분석 요청
export const analyze = async (file) => {
    // 로컬 스토리지 등에 저장된 사용자 피부 프로필 가져오기
    const profile = getProfile() || {}; 
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_profile', JSON.stringify(profile)); 

    const response = await api.post('/suncare/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data; // { status: "ACCEPTED", task_id: "..." }
};

// 2. 분석 상태 폴링 (경로에 /tasks가 포함되므로 axiosInstance가 알아서 8001로 보냄)
export const getTaskStatus = async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
};

// 3. 히스토리 목록 조회
export const fetchHistory = async () => {
    const response = await api.get('/suncare/analyses'); // 백엔드 라우터에 맞게 경로 확인
    return response.data;
};

// 4. 히스토리 상세 조회
export const fetchHistoryDetail = async (analysis_idx) => {
    const response = await api.get(`/suncare/analyses/${analysis_idx}`);
    return response.data;
};

// 5. 분석 결과의 추천 제품 조회
export const fetchRecommendations = async (analysis_idx) => {
    const response = await api.get('/suncare/recommendations', { 
        params: { analysis_idx } 
    });
    return response.data;
};

export const getAnalysisResult = async (taskId) => {
    const response = await api.get(`/suncare/results/${taskId}`);
    return response.data;
};