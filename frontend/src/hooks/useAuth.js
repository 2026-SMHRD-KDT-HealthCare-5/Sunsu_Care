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
  const token = result.token ?? result.accessToken
  const user = result.user ?? {}
  localStorage.setItem('authToken', token)
  localStorage.setItem('userEmail', user.email || email)
  localStorage.setItem('userNickname', user.nickname || '')
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
    userNickname,
    login,
    logout,
  }
}