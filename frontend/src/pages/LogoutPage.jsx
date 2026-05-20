import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Auth.css'

function LogoutPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [error, setError] = useState('')
  const ran = useRef(false)

  useEffect(() => {
    // React StrictMode에서 useEffect가 2번 호출되는 것 방지
    if (ran.current) return
    ran.current = true

    const doLogout = async () => {
      try {
        await logout()
        navigate('/login', { replace: true })
      } catch (e) {
        setError('로그아웃 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.')
      }
    }
    doLogout()
  }, [logout, navigate])

  return (
    <div className="page auth">
      <div className="auth__header">
        <h1 className="auth__title">로그아웃</h1>
        <p className="auth__subtitle">
          {error ? error : '안전하게 로그아웃 중입니다...'}
        </p>
      </div>
    </div>
  )
}

export default LogoutPage