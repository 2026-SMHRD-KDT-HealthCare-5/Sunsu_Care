import api from './axiosInstance';
import { getProfile } from '../utils/storage';

// 1. 제품 사진 분석 요청
export const analyze = async (file) => {
    const profile = getProfile() || {}; 
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_profile', JSON.stringify(profile)); 

    // baseURL에 /api/v1이 포함되어 있으므로 /suncare/analyze만 작성
    const response = await api.post('/suncare/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
};

// 2. 분석 상태 폴링
export const getTaskStatus = async (taskId) => {
    // baseURL이 적용되어 최종적으로 /api/v1/tasks/${taskId}가 호출됩니다.
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
};

// 3. 히스토리 목록 조회
export const fetchHistory = async () => {
    const response = await api.get('/suncare/analyses'); 
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

// 6. 분석 결과 상세 데이터 가져오기 (추가 제안된 경로 확인)
export const getAnalysisResult = async (taskId) => {
    const response = await api.get(`/suncare/results/${taskId}`);
    return response.data;
};