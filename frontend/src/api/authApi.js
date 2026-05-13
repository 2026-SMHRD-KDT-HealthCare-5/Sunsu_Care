// import api from './axiosInstance'  

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const login = async (email, password) => {
  await delay(500)
  // 18단계 교체: const { data } = await api.post('/auth/login', { email, password })
  // return data
  return {
    token: 'mock-token-' + Date.now(),
    user: { email },
  }
}

export const signup = async (email, password) => {
  await delay(500)
  // 18단계 교체: const { data } = await api.post('/auth/signup', { email, password })
  // return data
  return {
    success: true,
    user: { email },
  }
}

export const logout = async () => {
  // 18단계 교체: await api.post('/auth/logout')
  return { success: true }
}