// import api from './axiosInstance'

import mockAnalysisResult from '../data/mockAnalysisResult'
import { getHistory, findHistoryById } from '../utils/storage'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const analyze = async ({ productName, productImage, ingredientImage }) => {
  await delay(1500)

  // 18단계 교체:
  // const formData = new FormData()
  // formData.append('productName', productName)
  // if (productImage) formData.append('productImage', productImage)
  // formData.append('ingredientImage', ingredientImage)
  // const { data } = await api.post('/analyze', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' }
  // })
  // return data

  return {
    ...mockAnalysisResult,
    id: 'r' + Date.now(),
    productName,
    createdAt: new Date().toISOString(),
  }
}

export const fetchHistory = async () => {
  await delay(300)
  // 18단계 교체: const { data } = await api.get('/history'); return data
  return getHistory()
}

export const fetchHistoryDetail = async (id) => {
  await delay(300)
  // 18단계 교체: const { data } = await api.get(`/history/${id}`); return data
  return findHistoryById(id)
}