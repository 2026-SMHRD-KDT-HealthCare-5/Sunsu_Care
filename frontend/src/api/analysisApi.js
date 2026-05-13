// src/api/analysisApi.js
// import api from './axiosInstance'
import mockAnalysisResult, {
  mockHistory,
  mockRecommendations,
  findResultByIdx,
} from '../data/mockAnalysisResult'
import { getHistory, findHistoryById } from '../utils/storage'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const analyze = async ({ prod_name, product_image, ingredient_image }) => {
  await delay(1500)

  // 18단계 교체:
  // const formData = new FormData()
  // formData.append('prod_name', prod_name)
  // if (product_image) formData.append('product_image', product_image)
  // formData.append('ingredient_image', ingredient_image)
  // const { data } = await api.post('/analyze', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' }
  // })
  // return data

  return {
    ...mockAnalysisResult,
    analysis_idx: Date.now(),
    prod_name,
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