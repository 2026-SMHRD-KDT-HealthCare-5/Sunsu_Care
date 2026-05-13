
// import api from './axiosInstance'

import { getProfile, saveProfile } from '../utils/storage'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const fetchProfile = async () => {
  await delay(300)
  // 18단계 교체: const { data } = await api.get('/profile'); return data
  return getProfile()
}

export const updateProfile = async (profile) => {
  await delay(500)
  // 18단계 교체: const { data } = await api.put('/profile', profile); return data
  saveProfile(profile)
  return profile
}