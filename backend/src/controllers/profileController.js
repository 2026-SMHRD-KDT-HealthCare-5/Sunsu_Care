// Service 파일 호출
const profileService = require("../services/profileService")

// 1. 프로필 조회 API 요청 처리 함수
const getProfile = (req, res) => {
   // JWT 인증 미들웨어에서 req.user에 사용자 정보를 넣어줬는지 확인하기 위한 로그
  console.log('req.user:', req.user) 

  // JWT 인증 미들웨어에서 넣어준 사용자 정보 중 user_idx를 꺼냄
  // req.user가 없을 경우 에러가 나지 않도록 optional chaining 사용
  const user_idx = req.user?.user_idx

  // 실제 조회에 사용할 user_idx 확인 로그
  console.log('조회할 user_idx:', user_idx)

  // user_idx가 없으면 로그인 정보가 없거나 토큰 인증이 실패한 상황
  if (!user_idx) {
    // user_idx가 없어서 프로필 조회를 진행할 수 없다는 로그 출력
    console.log('프로필 조회 실패: user_idx 없음')

    // 클라이언트에게 인증 정보가 없다는 응답 반환
    return res.status(401).json({
      success: false,
      message: '로그인 정보가 없습니다.',
    })
  }

  // service에 user_idx를 전달하여 해당 사용자의 프로필 조회 요청
  profileService.getProfile(user_idx, (err, profile) => {
    // service 또는 DB 조회 중 에러가 발생한 경우
    if (err) {
      // 서버 터미널에 에러 내용 출력
      console.log('프로필 조회 service 에러:', err)

      // 클라이언트에게 서버 에러 응답 반환
      return res.status(500).json({
        success: false,
        message: '프로필 조회 실패',
        error: err.message,
      })
    }

    // service에서 받아온 profile 데이터 확인 로그
    console.log('service에서 받은 profile:', profile)

    // 조회된 프로필이 없는 경우
    if (!profile) {
      // 등록된 프로필이 없다는 로그 출력
      console.log('등록된 프로필 없음')

      // 클라이언트에게 프로필이 없다는 응답 반환
      return res.status(404).json({
        success: false,
        message: '등록된 프로필이 없습니다.',
        profile: null,
      })
    }

    // 프로필 조회 성공 로그 출력
    console.log('프로필 조회 성공')

    // 클라이언트에게 조회된 프로필 데이터 응답 반환
    return res.status(200).json({
      success: true,
      message: '프로필 조회 성공',
      profile,
    })
  })
}

// 다른 파일에서 getProfile 함수를 사용할 수 있도록 내보내기
module.exports = {
  getProfile,
}