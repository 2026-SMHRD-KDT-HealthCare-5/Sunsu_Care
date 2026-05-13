// src/pages/SignupPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { signup } from '../api/authApi'
import {
  validateId,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validateEmail,
  validatePhone,
} from '../utils/validation'
import './Auth.css'

function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    id: '',
    password: '',
    confirm: '',
    name: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const newErrors = {
      id: validateId(form.id),
      password: validatePassword(form.password),
      confirm: validatePasswordMatch(form.password, form.confirm),
      name: validateName(form.name),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
    }
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) return

    setSubmitting(true)
    try {
      await signup({
        id: form.id,
        password: form.password,
        name: form.name,
        email: form.email,
        phone: form.phone,
      })
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
          label="아이디"
          value={form.id}
          onChange={update('id')}
          placeholder="영문, 숫자 4~20자"
          error={errors.id}
        />
        <Input
          label="비밀번호"
          type="password"
          value={form.password}
          onChange={update('password')}
          placeholder="6자 이상"
          error={errors.password}
        />
        <Input
          label="비밀번호 확인"
          type="password"
          value={form.confirm}
          onChange={update('confirm')}
          placeholder="비밀번호 한 번 더"
          error={errors.confirm}
        />
        <Input
          label="이름"
          value={form.name}
          onChange={update('name')}
          placeholder="이름을 입력하세요"
          error={errors.name}
        />
        <Input
          label="이메일"
          type="email"
          value={form.email}
          onChange={update('email')}
          placeholder="example@suncare.com"
          error={errors.email}
        />
        <Input
          label="연락처"
          type="tel"
          value={form.phone}
          onChange={update('phone')}
          placeholder="010-1234-5678"
          error={errors.phone}
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