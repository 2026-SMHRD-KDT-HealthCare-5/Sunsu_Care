
// DB(tb_profile) 응답 형태 그대로
const mockUserProfile = {
  profile_idx: 1,
  user_id: 1,
  skin_type: '건성',
  senstive_yn: 4,                                              // 1~5 레벨
  prod_type: '크림',
  avoid_ingredient: JSON.stringify(['옥시벤존', '향료', '에탄올']),  // JSON 문자열
  joined_at: '2026-05-13T10:00:00Z',
}

export default mockUserProfile

// UI 옵션
export const PROFILE_OPTIONS = {
  skinType: ['지성', '건성', '복합성', '중성', '민감성'],
  prodType: ['에센스', '크림', '젤', '스틱', '스프레이'],
  sensitivity: [
    { value: 1, label: '낮음' },
    { value: 2, label: '약간' },
    { value: 3, label: '보통' },
    { value: 4, label: '높음' },
    { value: 5, label: '매우 민감' },
  ],
  commonAvoid: ['옥시벤존', '아보벤존', '향료', '에탄올', '파라벤', '실리콘'],
}