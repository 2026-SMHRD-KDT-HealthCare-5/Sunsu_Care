// import api from './axiosInstance'
import mockAnalysisResult, {
  mockHistory,
  mockRecommendations,
  findResultByIdx,
} from '../data/mockAnalysisResult'
import { getHistory, findHistoryById } from '../utils/storage'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const analyze = async ({ ingredient_image }) => {
  await delay(1500)

  // 18단계 교체:
  // const formData = new FormData()
  // formData.append('ingredient_image', ingredient_image)
  // const { data } = await api.post('/analyze', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' }
  // })
  // return data

  return {
    ...mockAnalysisResult,
    analysis_idx: Date.now(),
    analyzed_at: new Date().toISOString(),
  }
}

// 히스토리 목록 (mock: localStorage + 정적 mockHistory)
export const fetchHistory = async () => {
  await delay(300)
  // 18단계: const { data } = await api.get('/analyses'); return data
  const stored = getHistory()
  return stored.length > 0 ? stored : mockHistory
}

// 히스토리 상세
export const fetchHistoryDetail = async (analysis_idx) => {
  await delay(300)
  // 18단계: const { data } = await api.get(`/analyses/${analysis_idx}`); return data
  const stored = findHistoryById(analysis_idx)
  if (stored) return stored
  return findResultByIdx(Number(analysis_idx))
}

// 분석 결과의 추천 제품
export const fetchRecommendations = async (analysis_idx) => {
  await delay(300)
  // 18단계: const { data } = await api.get('/recommendations', { params: { analysis_idx } })
  return mockRecommendations
}

// 🌟 하얀 창 에러를 고치기 위해 추가한 함수! (작업 상태 확인)
export const getTaskStatus = async (taskId) => {
    console.log("작업 상태 확인 요청 taskId:", taskId);
    
    // 분석이 완료되었다고 가정하고 가짜 결과 데이터 반환
    return {
        status: "success", 
        progress: 100,
        message: "분석이 완료되었습니다.",
        result: {
            score: 85,
            status: "적합",
            keyIngredients: ["나이아신아마이드", "히알루론산"],
            warnIngredients: []
        }
    };
};