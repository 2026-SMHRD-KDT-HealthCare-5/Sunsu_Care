// Service 파일 호출 [require()를 사용 중이니 CommonJS 방식]
const profileService = require("../services/profileService")

// 1. 프로필 조회 API 요청 처리 함수
const getProfile = async (req, res, next) => {
  try {
    // ?: optional chainin으로 req.user가 없으면 에러를 내지 않고 undefined를 반환
    const user_idx = req.user?.user_idx

    if (!user_idx) {
      console.log("프로필 조회 실패: user_idx 없음")
      return res.status(401).json({
        success: false,
        message: "로그인 정보가 없습니다.",
      })
    }

    // user_idx가 객체로 들어온 경우를 미리 차단
    if (typeof user_idx === "object") {
      console.log("프로필 조회 실패: user_idx 형식 오류", {
        user_idx,
        type: typeof user_idx,
      })

      const error = new Error("user_idx 형식이 올바르지 않습니다.")
      error.status = 500
      return next(error)
    }

    //함수 호출하여 user_idx 넘겨 사용자의 프로피을 DB에서 조회
    // 수정한 이유:
    // 기존에는 callback 방식으로 service 결과를 받았지만,
    // profileService가 async/await 방식으로 변경되었기 때문에
    // await profileService.getProfile(user_idx)로 직접 결과를 받음
    console.log("프로필 조회 요청 값:", { user_idx })

    const profile = await profileService.getProfile(user_idx)

    if (!profile) {
      console.log("프로필 조회 결과 없음:", { user_idx })

      return res.status(404).json({
        success: false,
        message: "등록된 프로필이 없습니다.",
        profile: null,
      })
    }

    console.log("프로필 조회 성공:", {
      user_idx,
      profile_idx: profile.profile_idx,
    })

    return res.status(200).json({
      success: true,
      message: "프로필 조회 성공",
      profile,
    })
  } catch (err) {
    console.log("프로필 조회 service 에러:", err)
    console.log("프로필 조회 에러 message:", err.message)
    console.log("프로필 조회 에러 code:", err.code)

    // DB/서버 에러는 app.js의 전역 에러 처리 미들웨어로 전달
    const error = new Error("프로필 조회 실패")
    error.status = 500
    return next(error)
  }
}

// 2. 프로필 저장/수정 API 요청 처리 함수
const updateProfile = async (req, res, next) => {
  try {
    const user_idx = req.user?.user_idx

    if (!user_idx) {
      console.log("프로필 저장/수정 실패: user_idx 없음")

      return res.status(401).json({
        success: false,
        message: "로그인 정보가 없습니다.",
      })
    }

    // user_idx가 객체로 들어온 경우를 미리 차단
    if (typeof user_idx === "object") {
      console.log("프로필 저장/수정 실패: user_idx 형식 오류", {
        user_idx,
        type: typeof user_idx,
      })

      const error = new Error(
        "user_idx 형식이 올바르지 않습니다. req.user 전체가 아니라 req.user.user_idx를 넘겨야 합니다.",
      )
      error.status = 500
      return next(error)
    }

    const profileData = req.body

    console.log("프로필 저장/수정 요청 값:", {
      user_idx,
      fields: Object.keys(profileData || {}),
      hasSkinType: !!profileData?.skin_type,
      hasActivityEnv: !!profileData?.activity_env,
      hasProdType: !!profileData?.prod_type,
      hasAvoidIngredient: !!profileData?.avoid_ingredient,
    })

    //함수 호출하여 user_idx 넘겨 사용자의 프로피을 DB에 저장/수정
    // 수정한 이유:
    // 기존에는 callback 방식으로 service 결과를 받았지만,
    // profileService가 async/await 방식으로 변경되었기 때문에
    // await profileService.updateProfile(user_idx, profileData)로 직접 결과를 받음

    const result = await profileService.updateProfile(user_idx, profileData)

    console.log("프로필 저장/수정 성공:", {
      user_idx,
      action: result.action,
      profile_idx: result.profile_idx || result.savedProfile?.profile_idx,
      affectedRows: result.affectedRows,
    })

    return res.status(200).json({
      success: true,
      message: "프로필 저장/수정 성공",
      result,
    })
  } catch (err) {
    console.log("프로필 저장/수정 service 에러:", err)
    console.log("프로필 저장/수정 에러 message:", err.message)
    console.log("프로필 저장/수정 에러 code:", err.code)

    // DB/서버 에러는 app.js의 전역 에러 처리 미들웨어로 전달
    const error = new Error("프로필 저장/수정 실패")
    error.status = 500
    return next(error)
  }
}

// 다른 파일에서 사용할 수 있도록 내보내기
module.exports = {
  getProfile,
  updateProfile,
}
