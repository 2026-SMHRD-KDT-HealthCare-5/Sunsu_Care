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
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const sync = () => {
      setToken(getAuthToken())
      setEmail(getUserEmail() || '')
      setUserName(localStorage.getItem('userName') || '')
      setUserId(localStorage.getItem('userId') || '')
    }
    sync()
    window.addEventListener(AUTH_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(AUTH_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const login = async (id, password) => {
    const result = await loginApi(id, password)
    localStorage.setItem('authToken', result.token)
    localStorage.setItem('userId', result.user.id || id)
    localStorage.setItem('userEmail', result.user.email || '')
    localStorage.setItem('userName', result.user.name || '')
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
    userName,
    userId,
    login,
    logout,
  }
}