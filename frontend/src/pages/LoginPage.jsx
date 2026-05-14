// src/pages/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { useAuth } from '../hooks/useAuth'
import { validateEmail, validatePassword } from '../utils/validation'
import './Auth.css'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    }
    setErrors(newErrors)
    if (newErrors.email || newErrors.password) return

    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setSubmitError('로그인에 실패했어요. 이메일/비밀번호를 확인해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page auth">
      <div className="auth__header">
        <h1 className="auth__title">로그인</h1>
        <p className="auth__subtitle">SunCare에 오신 걸 환영합니다 🌞</p>
      </div>

      <form className="auth__form" onSubmit={handleSubmit}>
        <Input
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@suncare.com"
          error={errors.email}
        />
        <Input
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요"
          error={errors.password}
        />

        {submitError && <p className="auth__error">{submitError}</p>}

        <Button size="lg" type="submit" disabled={submitting}>
          {submitting ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      <p className="auth__link">
        아직 회원이 아니신가요?
        <Link to="/signup">회원가입</Link>
      </p>
    </div>
  )
}

export default LoginPage