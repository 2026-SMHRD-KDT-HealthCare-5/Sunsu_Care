import api from './axiosInstance'

// 1. 페이지에서 사용하는 형태 -> DB 저장용 형태 (변환 함수)
const toDbModel = (viewProfile) => ({
  skin_type: viewProfile.skin_type,           // 프론트 데이터 필드명 확인
  sensitivity: viewProfile.sensitivity,       // 백엔드: sensitivity 로 받음
  preferred_texture: viewProfile.preferred_texture, // 백엔드: preferred_texture 로 받음
  avoid_ingredient: JSON.stringify(viewProfile.avoid_ingredient || []),
})

// 2. DB 형태 -> 페이지 사용 형태 (조회 시 사용)
const toViewModel = (dbProfile) => {
  if (!dbProfile) return null
  try {
    return {
      ...dbProfile,
      avoid_ingredient: JSON.parse(dbProfile.avoid_ingredient || '[]')
    }
  } catch (e) {
    return { ...dbProfile, avoid_ingredient: [] }
  }
}

// 프로필 조회
export const fetchProfile = async () => {
  const { data } = await api.get('/profile')
  return toViewModel(data.profile)
}

// 프로필 저장/수정
export const updateProfile = async (profile) => {
  const dbData = toDbModel(profile);
  console.log("서버로 보낼 데이터:", dbData); // 디버깅용
  
  const { data } = await api.put('/profile', dbData);
  return data;
}