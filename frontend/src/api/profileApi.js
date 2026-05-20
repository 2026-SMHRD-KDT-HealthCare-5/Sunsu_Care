// src/api/profileApi.js
import api from './axiosInstance'

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

// 프로필 조회
export const fetchProfile = async () => {
  const { data } = await api.get('/profile')
  return toViewModel(data.profile)
}

// 프로필 저장/수정
export const updateProfile = async (profile) => {
  const { data } = await api.put('/profile', toDbModel(profile))
  return data
}