
const mockUserProfile = {
  gender: 'female',                  // 'male' | 'female'
  skinType: '건성',                  // '지성' | '건성' | '복합성' | '중성' | '민감성'
  sensitive: true,                   // 민감도 여부
  preferType: '무기자차',            // '유기자차' | '무기자차' | '혼합'
  avoidIngredients: ['옥시벤존', '향료', '에탄올'],
  concerns: ['기미', '각질', '건조함'],
}

export default mockUserProfile

// 선택지 모음 (UI에서 옵션 리스트로 사용)
export const PROFILE_OPTIONS = {
  gender: ['male', 'female'],
  skinType: ['지성', '건성', '복합성', '중성', '민감성'],
  preferType: ['유기자차', '무기자차', '혼합'],
  concerns: ['기미', '주름', '각질', '건조함', '여드름', '홍조', '색소침착'],
  commonAvoid: ['옥시벤존', '아보벤존', '향료', '에탄올', '파라벤', '실리콘'],
}