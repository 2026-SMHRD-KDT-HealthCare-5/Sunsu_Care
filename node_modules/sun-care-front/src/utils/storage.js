

// localStorage 키 모음 (한 곳에서만 관리)
const KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_EMAIL: 'userEmail',
  USER_PROFILE: 'userProfile',
  ANALYSIS_HISTORY: 'analysisHistory',
  LAST_RESULT: 'lastResult',
}

// ───── 인증 ─────
export const getAuthToken = () => localStorage.getItem(KEYS.AUTH_TOKEN)
export const getUserEmail = () => localStorage.getItem(KEYS.USER_EMAIL)

// ───── 프로필 ─────
export const getProfile = () => {
  const raw = localStorage.getItem(KEYS.USER_PROFILE)
  return raw ? JSON.parse(raw) : null
}
export const saveProfile = (profile) => {
  localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile))
}

// ───── 분석 히스토리 ─────
export const getHistory = () => {
  const raw = localStorage.getItem(KEYS.ANALYSIS_HISTORY)
  return raw ? JSON.parse(raw) : []
}
export const addHistory = (result) => {
  const list = getHistory()
  list.unshift(result) // 최신이 맨 앞
  localStorage.setItem(KEYS.ANALYSIS_HISTORY, JSON.stringify(list))
}

// ───── 마지막 분석 결과 (새로고침 대비) ─────
export const setLastResult = (result) => {
  localStorage.setItem(KEYS.LAST_RESULT, JSON.stringify(result))
}
export const getLastResult = () => {
  const raw = localStorage.getItem(KEYS.LAST_RESULT)
  return raw ? JSON.parse(raw) : null
}

// ───── 전체 정리 (로그아웃) ─────
export const clearAllStorage = () => {
  localStorage.clear()
  sessionStorage.clear()
}

export const findHistoryById = (id) => {
  const list = getHistory()
  return list.find((r) => r.id === id) || null
}