// src/utils/validation.js

// 아이디 (영문/숫자/_, 4~20자)
export const validateId = (id) => {
  if (!id.trim()) return '아이디를 입력해주세요.'
  if (id.length < 4) return '아이디는 4자 이상이어야 합니다.'
  if (id.length > 20) return '아이디는 20자 이하여야 합니다.'
  if (!/^[a-zA-Z0-9_]+$/.test(id)) return '영문, 숫자, _ 만 사용 가능합니다.'
  return ''
}

// 이메일
export const validateEmail = (email) => {
  if (!email.trim()) return '이메일을 입력해주세요.'
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(email)) return '올바른 이메일 형식이 아닙니다.'
  return ''
}

// 비밀번호 (6자 이상)
export const validatePassword = (password) => {
  if (!password) return '비밀번호를 입력해주세요.'
  if (password.length < 6) return '비밀번호는 6자 이상이어야 합니다.'
  return ''
}

// 비밀번호 확인 일치
export const validatePasswordMatch = (password, confirm) => {
  if (!confirm) return '비밀번호를 한 번 더 입력해주세요.'
  if (password !== confirm) return '비밀번호가 일치하지 않습니다.'
  return ''
}

// 이름 (2자 이상)
export const validateName = (name) => {
  if (!name.trim()) return '이름을 입력해주세요.'
  if (name.trim().length < 2) return '이름은 2자 이상이어야 합니다.'
  return ''
}

// 휴대폰 번호 (010-XXXX-XXXX 또는 01012345678)
export const validatePhone = (phone) => {
  if (!phone.trim()) return '연락처를 입력해주세요.'
  const cleaned = phone.replace(/-/g, '').replace(/\s/g, '')
  if (!/^01[0-9]{8,9}$/.test(cleaned)) {
    return '올바른 휴대폰 번호 형식이 아닙니다.'
  }
  return ''
}