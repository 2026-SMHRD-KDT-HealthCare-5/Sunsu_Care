// 모든 페이지에서 쓸 날짜 포맷 헬퍼. 
// 백엔드는 보통 ISO 문자열(2026-05-13T10:30:00)을 주는데, 
// 화면에는 2026.05.13 같은 한국식으로 표시하고 싶을 때 씁니다.

// 2026.05.13
export const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

// 2026.05.13 10:30
export const formatDateTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const date = formatDate(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${date} ${hh}:${mm}`
}