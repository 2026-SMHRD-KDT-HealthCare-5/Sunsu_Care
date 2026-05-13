
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { signup } from '../api/authApi'
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '../utils/validation'
import './Auth.css'

function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validatePasswordMatch(password, confirm),
    }
    setErrors(newErrors)
    if (newErrors.email || newErrors.password || newErrors.confirm) return

    setSubmitting(true)
    try {
      await signup(email, password)
      setShowSuccess(true)
    } catch (err) {
      setSubmitError('회원가입에 실패했어요. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAfterSuccess = () => {
    setShowSuccess(false)
    navigate('/login')
  }

  return (
    <div className="page auth">
      <div className="auth__header">
        <h1 className="auth__title">회원가입</h1>
        <p className="auth__subtitle">간단하게 가입하고 시작하세요</p>
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
          placeholder="6자 이상"
          error={errors.password}
        />
        <Input
          label="비밀번호 확인"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="비밀번호 한 번 더"
          error={errors.confirm}
        />

        {submitError && <p className="auth__error">{submitError}</p>}

        <Button size="lg" type="submit" disabled={submitting}>
          {submitting ? '가입 중...' : '가입하기'}
        </Button>
      </form>

      <p className="auth__link">
        이미 회원이신가요?
        <Link to="/login">로그인</Link>
      </p>

      <Modal
        isOpen={showSuccess}
        onClose={handleAfterSuccess}
        title="가입 완료 🎉"
      >
        SunCare에 오신 걸 환영합니다.
        <br />
        로그인 화면으로 이동합니다.
      </Modal>
    </div>
  )
}

export default SignupPage