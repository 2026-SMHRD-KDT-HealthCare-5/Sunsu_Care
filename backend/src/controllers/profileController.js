// Service 파일 호출 [require()를 사용 중이니 CommonJS 방식]
const profileService = require("../services/profileService")

// 1. 프로필 조회 API 요청 처리 함수
const getProfile = async (req, res) => {
  try {
    //요청 객체 안에 user 정보 확인
    console.log("req.user:", req.user)

    // ?: optional chainin으로 req.user가 없으면 에러를 내지 않고 undefined를 반환
    const user_idx = req.user?.user_idx

    //user의 idx 확인
    console.log("조회할 user_idx:", user_idx)
    console.log("조회할 user_idx 타입:", typeof user_idx)

    if (!user_idx) {
      console.log("프로필 조회 실패: user_idx 없음")

      return res.status(401).json({
        success: false,
        message: "로그인 정보가 없습니다.",
      })
    }

    // user_idx가 객체로 들어온 경우를 미리 차단
    if (typeof user_idx === "object") {
      console.log("프로필 조회 실패: user_idx에 객체가 들어옴:", user_idx)

      return res.status(500).json({
        success: false,
        message: "user_idx 형식이 올바르지 않습니다.",
      })
    }

    //함수 호출하여 user_idx 넘겨 사용자의 프로피을 DB에서 조회
    // 수정한 이유:
    // 기존에는 callback 방식으로 service 결과를 받았지만,
    // profileService가 async/await 방식으로 변경되었기 때문에
    // await profileService.getProfile(user_idx)로 직접 결과를 받음
    console.log("profileService.getProfile 호출 직전")

    const profile = await profileService.getProfile(user_idx)

    console.log("service에서 받은 profile:", profile)

    if (!profile) {
      console.log("등록된 프로필 없음")

      return res.status(404).json({
        success: false,
        message: "등록된 프로필이 없습니다.",
        profile: null,
      })
    }

    console.log("프로필 조회 성공")

    return res.status(200).json({
      success: true,
      message: "프로필 조회 성공",
      profile,
    })
  } catch (err) {
    console.log("프로필 조회 service 에러:", err)
    console.log("프로필 조회 에러 message:", err.message)
    console.log("프로필 조회 에러 code:", err.code)

    return res.status(500).json({
      success: false,
      message: "프로필 조회 실패",
      error: err.message,
    })
  }
}

// 2. 프로필 저장/수정 API 요청 처리 함수
const updateProfile = async (req, res) => {
  try {
    console.log("req.user:", req.user)
    console.log("req.body:", req.body)

    const user_idx = req.user?.user_idx

    console.log("저장/수정할 user_idx:", user_idx)
    console.log("저장/수정할 user_idx 타입:", typeof user_idx)

    if (!user_idx) {
      console.log("프로필 저장/수정 실패: user_idx 없음")

      return res.status(401).json({
        success: false,
        message: "로그인 정보가 없습니다.",
      })
    }

    // user_idx가 객체로 들어온 경우를 미리 차단
    if (typeof user_idx === "object") {
      console.log("프로필 저장/수정 실패: user_idx에 객체가 들어옴:", user_idx)

      return res.status(500).json({
        success: false,
        message: "user_idx 형식이 올바르지 않습니다. req.user 전체가 아니라 req.user.user_idx를 넘겨야 합니다.",
      })
    }

    const profileData = req.body

    console.log("profileData:", profileData)
    console.log("profileData 타입:", typeof profileData)
    console.log("profileData 키 목록:", Object.keys(profileData))

    // 프론트에서 넘어오는 값 확인
    console.log("profileData.skin_type:", profileData.skin_type)
    console.log("profileData.sensitivity:", profileData.sensitivity)
    console.log("profileData.preferred_texture:", profileData.preferred_texture)
    console.log("profileData.avoid_ingredient:", profileData.avoid_ingredient)

    //함수 호출하여 user_idx 넘겨 사용자의 프로피을 DB에 저장/수정
    // 수정한 이유:
    // 기존에는 callback 방식으로 service 결과를 받았지만,
    // profileService가 async/await 방식으로 변경되었기 때문에
    // await profileService.updateProfile(user_idx, profileData)로 직접 결과를 받음
    console.log("profileService.updateProfile 호출 직전")

    const result = await profileService.updateProfile(user_idx, profileData)

    console.log("프로필 저장/수정 성공:", result)

    return res.status(200).json({
      success: true,
      message: "프로필 저장/수정 성공",
      result,
    })
  } catch (err) {
    console.log("프로필 저장/수정 service 에러:", err)
    console.log("프로필 저장/수정 에러 message:", err.message)
    console.log("프로필 저장/수정 에러 code:", err.code)

    return res.status(500).json({
      success: false,
      message: "프로필 저장/수정 실패",
      error: err.message,
    })
  }
}

// 다른 파일에서 사용할 수 있도록 내보내기
module.exports = {
  getProfile,
  updateProfile,
}