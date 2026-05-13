// src/api/productApi.js
// import api from './axiosInstance'
import mockProducts, { findProductByIdx } from '../data/mockProducts'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const fetchAllProducts = async () => {
  await delay(300)
  // 18단계 교체: const { data } = await api.get('/products'); return data
  return mockProducts
}

export const fetchProductById = async (prod_idx) => {
  await delay(300)
  // 18단계 교체: const { data } = await api.get(`/products/${prod_idx}`); return data
  return findProductByIdx(prod_idx) || null
}