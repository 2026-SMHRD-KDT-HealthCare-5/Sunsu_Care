
// 이메일 검증: 빈 값 + 형식 확인
export const validateEmail = (email) => {
  if (!email.trim()) return '이메일을 입력해주세요.'
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(email)) return '올바른 이메일 형식이 아닙니다.'
  return ''
}

// 비밀번호 검증: 빈 값 + 최소 길이
export const validatePassword = (password) => {
  if (!password) return '비밀번호를 입력해주세요.'
  if (password.length < 6) return '비밀번호는 6자 이상이어야 합니다.'
  return ''
}

// 비밀번호 확인 검증: 일치 여부
export const validatePasswordMatch = (password, confirm) => {
  if (!confirm) return '비밀번호를 한 번 더 입력해주세요.'
  if (password !== confirm) return '비밀번호가 일치하지 않습니다.'
  return ''
}