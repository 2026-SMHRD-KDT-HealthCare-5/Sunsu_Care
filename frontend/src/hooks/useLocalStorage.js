// 값이 바뀌면 자동으로 localStorage에 저장. useState처럼 쓰지만 새로고침해도 값이 유지
import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const raw = localStorage.getItem(key)
    if (raw === null) return initialValue
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  })

  useEffect(() => {
    if (value === null || value === undefined) {
      localStorage.removeItem(key)
      return
    }
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}