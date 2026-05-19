// src/hooks/useAuth.js
import { useState, useEffect } from 'react'
import { login as loginApi, logout as logoutApi } from '../api/authApi'
import {
  getAuthToken,
  getUserEmail,
  clearAllStorage,
} from '../utils/storage'

const AUTH_EVENT = 'sun-care-auth-change'

export function useAuth() {
  const [token, setToken] = useState(null)
  const [email, setEmail] = useState('')
  const [userNickname, setUserNickname] = useState('')

  useEffect(() => {
    const sync = () => {
      setToken(getAuthToken())
      setEmail(getUserEmail() || '')
      setUserNickname(localStorage.getItem('userNickname') || '')
    }

    sync()

    window.addEventListener(AUTH_EVENT, sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(AUTH_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const login = async (email, password) => {
    const result = await loginApi({ email, password })

    console.log('로그인 응답:', result)

    if (!result.success) {
      throw new Error(result.message || '로그인 실패')
    }

    if (!result.token) {
      throw new Error('로그인 토큰이 없습니다.')
    }

    localStorage.setItem('authToken', result.token)
    localStorage.setItem('userEmail', result.user.email || email)
    localStorage.setItem('userNickname', result.user.nickname || '')
    window.dispatchEvent(new Event(AUTH_EVENT))

    return result
  }

  const logout = async () => {
    try {
      console.log('로그아웃 요청 시작')
      await logoutApi()
      console.log('로그아웃 API 성공')
    } catch (err) {
      console.error('로그아웃 API 실패:', err)
    } finally {
      clearAllStorage()
      window.dispatchEvent(new Event(AUTH_EVENT))
      console.log('로컬 저장소 삭제 완료')
    }
  }

  return {
    isLoggedIn: !!token,
    userEmail: email,
    userNickname,
    login,
    logout,
  }
}