// frontend/src/api/profileApi.js
import api from './axiosInstance'

// 1. 페이지에서 사용하는 형태 -> DB 저장용 형태 (변환 함수)
const toDbModel = (viewProfile) => ({
  skin_type: viewProfile.skin_type,             // 피부 타입 (건성, 지성 등)
  activity_env: viewProfile.activity_env,       // 백엔드: activity_env 로 받음 (기존 sensitivity 대체)
  prod_type: viewProfile.prod_type,             // 백엔드: prod_type 으로 받음 (기존 preferred_texture 대체)
  
  // 피부 고민(avoid_ingredient)이 배열로 들어올 경우 문자열화, 단순 문자열일 경우 그대로 전달
  avoid_ingredient: Array.isArray(viewProfile.avoid_ingredient) 
    ? JSON.stringify(viewProfile.avoid_ingredient) 
    : viewProfile.avoid_ingredient || '',
})

// 2. DB 형태 -> 페이지 사용 형태 (조회 시 사용)
const toViewModel = (dbProfile) => {
  if (!dbProfile) return null

  let parsedIngredient = dbProfile.avoid_ingredient;
  try {
    // DB에 배열(JSON) 형태로 저장되어 있을 경우 파싱 시도
    parsedIngredient = JSON.parse(dbProfile.avoid_ingredient || '[]');
  } catch (e) {
    // 파싱 에러 발생 시 (단순 문자열로 저장되어 있는 경우) 원본 그대로 반환
    parsedIngredient = dbProfile.avoid_ingredient || '';
  }

  return {
    ...dbProfile,
    avoid_ingredient: parsedIngredient
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
  console.log("서버로 보낼 최종 매핑 데이터:", dbData); // 디버깅용
  
  const { data } = await api.put('/profile', dbData);
  return data;
}