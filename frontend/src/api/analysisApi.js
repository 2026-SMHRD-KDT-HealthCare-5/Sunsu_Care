import api from './axiosInstance';
import { getProfile } from '../utils/storage';

// 1. 제품 사진 분석 요청
//    Express(/suncare/upload) 를 거쳐 tb_upload 저장 + FastAPI 위임까지 한 번에 처리
//    응답: { task_id, status, file_idx }
export const analyze = async (file) => {
    const profile = getProfile() || {};

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_profile', JSON.stringify(profile));

    // /suncare/upload → axiosInstance 인터셉터가 Express(VITE_API_BASE_URL)로 라우팅
    const response = await api.post('/suncare/upload', formData, {
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

// 5. 사용자 프로필 기반 추천 제품 TOP 3
export const fetchRecommendations = async () => {
    const response = await api.get('/suncare/recommendations');
    return response.data; // [{ prod_idx, prod_name, brand_name, spf_val, pa_val, uv_type, image_filename, score, status }, ...]
};

// 6. 분석 결과 상세 데이터 가져오기 (추가 제안된 경로 확인)
export const getAnalysisResult = async (taskId) => {
    const response = await api.get(`/suncare/results/${taskId}`);
    return response.data;
};

// 7. AI 추천 이유 생성 (Gemini API 활용)
//    analysisIdx 같이 보내면 백엔드가 캐싱하여 같은 분석은 한 번만 호출
export const generateAIReason = async ({ analysisIdx, prodName, score, keyIng, warnIng, skinType }) => {
    const response = await api.post('/suncare/ai-reason', {
        analysisIdx,
        prodName,
        score,
        keyIng,
        warnIng,
        skinType
    });
    return response.data; // { reason: "...", cached: boolean }
};

// 8. 분석 히스토리 저장 (최대 5개, 초과 시 가장 오래된 것 자동 삭제)
export const saveAnalysis = async (analysisIdx) => {
    const response = await api.post(`/suncare/analyses/${analysisIdx}/save`);
    return response.data; // { success, alreadySaved?, removedOldest? }
};

// 9. 분석 히스토리 삭제
export const deleteAnalysis = async (analysisIdx) => {
    const response = await api.delete(`/suncare/analyses/${analysisIdx}`);
    return response.data;
};