// src/api/authApi.js
import api from './axiosInstance'

export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', {
    email,
    password,
  })

  return data
}

export const signup = async ({ email, password, nickname }) => {
  const { data } = await api.post('/auth/signup', {
    email,
    password,
    nickname,
  })

  return data
}

export const logout = async () => {
  const { data } = await api.post('/auth/logout')
  return data
}