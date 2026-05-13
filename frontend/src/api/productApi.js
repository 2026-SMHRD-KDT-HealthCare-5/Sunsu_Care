// import api from './axiosInstance'

import mockProducts, { findProductById } from '../data/mockProducts'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const fetchRecommends = async (ids = []) => {
  await delay(300)
  // 18단계 교체: const { data } = await api.get('/products/recommends', { params: { ids } }); return data
  return ids.map((id) => findProductById(id)).filter(Boolean)
}

export const fetchAllProducts = async () => {
  await delay(300)
  // 18단계 교체: const { data } = await api.get('/products'); return data
  return mockProducts
}