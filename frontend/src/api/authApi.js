// src/api/authApi.js
// import api from './axiosInstance'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const login = async (id, password) => {
  await delay(500)
  // 18단계 교체: const { data } = await api.post('/auth/login', { id, password })
  return {
    token: 'mock-token-' + Date.now(),
    user: {
      user_idx: 1,
      id,
      name: 'Mock 사용자',
      email: 'mock@example.com',
      role: 'user',
    },
  }
}

export const signup = async ({ id, password, name, email, phone }) => {
  await delay(500)
  // 18단계 교체:
  // const { data } = await api.post('/auth/signup', { id, password, name, email, phone })
  // return data
  return {
    success: true,
    user: { user_idx: 1, id, name, email },
  }
}

export const logout = async () => {
  // 18단계 교체: await api.post('/auth/logout')
  return { success: true }
}