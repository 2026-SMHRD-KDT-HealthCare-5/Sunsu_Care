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

// 닉네임 변경
export const updateNickname = async (nickname) => {
  const { data } = await api.put('/auth/nickname', { nickname })
  return data
}

// 비밀번호 변경
export const updatePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put('/auth/password', { currentPassword, newPassword })
  return data
}

// 회원 탈퇴
export const deleteAccount = async () => {
  const { data } = await api.delete('/auth/me')
  return data
}
