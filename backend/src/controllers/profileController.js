// Service 파일 호출 [require()를 사용 중이니 CommonJS 방식]
const profileService = require("../services/profileService")

// 1. 프로필 조회 API 요청 처리 함수
const getProfile = (req, res) => {
  
  //요청 객체 안에 user 정보 확인
  console.log('req.user:', req.user)

  // ?: optional chainin으로 req.user가 없으면 에러를 내지 않고 undefined를 반환
  const user_idx = req.user?.user_idx

  //user의 idx 확인
  console.log('조회할 user_idx:', user_idx)

  if (!user_idx) {
    console.log('프로필 조회 실패: user_idx 없음')

    return res.status(401).json({
      success: false,
      message: '로그인 정보가 없습니다.',
    })
  }

  //함수 호출하여 user_idx 넘겨 사용자의 프로피을 DB에서 조회
  profileService.getProfile(user_idx, (err, profile) => {
    if (err) {
      console.log('프로필 조회 service 에러:', err)

      return res.status(500).json({
        success: false,
        message: '프로필 조회 실패',
        error: err.message,
      })
    }
    console.log('service에서 받은 profile:', profile)

    if (!profile) {
      console.log('등록된 프로필 없음')

      return res.status(404).json({
        success: false,
        message: '등록된 프로필이 없습니다.',
        profile: null,
      })
    }
    console.log('프로필 조회 성공')
    return res.status(200).json({
      success: true,
      message: '프로필 조회 성공',
      profile,
    })
  })
}

// 2. 프로필 저장/수정 API 요청 처리 함수
const updateProfile = (req, res) => {
  console.log('req.user:', req.user)
  console.log('req.body:', req.body)

  const user_idx = req.user?.user_idx

  if (!user_idx) {
    console.log('프로필 저장/수정 실패: user_idx 없음')

    return res.status(401).json({
      success: false,
      message: '로그인 정보가 없습니다.',
    })
  }

  const profileData = req.body

  profileService.updateProfile(user_idx, profileData, (err, result) => {
    if (err) {
      console.log('프로필 저장/수정 service 에러:', err)

      return res.status(500).json({
        success: false,
        message: '프로필 저장/수정 실패',
        error: err.message,
      })
    }

    console.log('프로필 저장/수정 성공:', result)

    return res.status(200).json({
      success: true,
      message: '프로필 저장/수정 성공',
      result,
    })
  })
}

// 다른 파일에서 사용할 수 있도록 내보내기
module.exports = {
  getProfile,
  updateProfile
}