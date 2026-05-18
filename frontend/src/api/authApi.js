// import api from './axiosInstance'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const login = async (email, password) => {
  await delay(500)
  // 18단계 교체: const { data } = await api.post('/auth/login', { email, password })
  return {
    token: 'mock-token-' + Date.now(),
    user: {
      user_idx: 1,
      email,
      name: 'Mock 사용자',
      role: 'user',
    },
  }
}

export const signup = async ({ email, password, name }) => {
  await delay(500)
  // 18단계 교체:
  // const { data } = await api.post('/auth/signup', { email, password, nickname })
  // return data
  return {
    success: true,
    user: { user_idx: 1, email, name },
  }
}

export const logout = async () => {
  // 18단계 교체: await api.post('/auth/logout')
  return { success: true }
}