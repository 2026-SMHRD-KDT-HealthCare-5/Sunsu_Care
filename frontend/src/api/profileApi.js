// src/api/profileApi.js
// import api from './axiosInstance'
import { getProfile as readStorage, saveProfile as writeStorage } from '../utils/storage'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// DB 형태 → 페이지 사용 형태 (JSON 문자열 → 배열)
const toViewModel = (dbProfile) => {
  if (!dbProfile) return null
  let avoid = []
  try {
    avoid = JSON.parse(dbProfile.avoid_ingredient || '[]')
  } catch {
    avoid = []
  }
  return {
    ...dbProfile,
    avoid_ingredient: avoid,
  }
}

// 페이지 사용 형태 → DB 형태 (배열 → JSON 문자열)
const toDbModel = (viewProfile) => ({
  ...viewProfile,
  avoid_ingredient: JSON.stringify(viewProfile.avoid_ingredient || []),
})

export const fetchProfile = async () => {
  await delay(300)
  // 18단계 교체: const { data } = await api.get('/profile'); return toViewModel(data)
  return toViewModel(readStorage())
}

export const updateProfile = async (profile) => {
  await delay(500)
  // 18단계 교체:
  // const { data } = await api.put('/profile', toDbModel(profile))
  // return toViewModel(data)
  const dbForm = toDbModel(profile)
  writeStorage(dbForm)
  return toViewModel(dbForm)
}