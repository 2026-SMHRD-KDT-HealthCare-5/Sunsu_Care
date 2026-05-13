// 어디서든 const { isLoggedIn, userEmail, login, logout } = useAuth() 한 줄로 인증 상태 사용. 
// 로그인/로그아웃 시 같은 탭의 모든 컴포넌트가 즉시 업데이트 됨.

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

  useEffect(() => {
    const sync = () => {
      setToken(getAuthToken())
      setEmail(getUserEmail() || '')
    }
    sync()
    window.addEventListener(AUTH_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(AUTH_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const login = async (userEmail, password) => {
    const result = await loginApi(userEmail, password)
    localStorage.setItem('authToken', result.token)
    localStorage.setItem('userEmail', userEmail)
    window.dispatchEvent(new Event(AUTH_EVENT))
    return result
  }

  const logout = async () => {
    try {
      await logoutApi()
    } finally {
      clearAllStorage()
      window.dispatchEvent(new Event(AUTH_EVENT))
    }
  }

  return {
    isLoggedIn: !!token,
    userEmail: email,
    login,
    logout,
  }
}