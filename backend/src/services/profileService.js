const profileRepository = require("../repositories/profileRepository");

// 1. 프로필 조회 처리 함수
// controller에서 JWT 인증 후 전달받은 user_idx 기준으로 사용자 프로필을 조회
const getProfile = async (user_idx) => {
  try {
    // 1-1. user_idx 타입 검증
    // JWT 미들웨어에서 꺼낸 사용자 식별값은 숫자 형태여야 함
    if (typeof user_idx === "object") {
      throw new Error("user_idx에는 숫자가 들어와야 합니다.");
    }

    // 1-2. user_idx 존재 여부 검증
    // 로그인 사용자 정보가 없으면 프로필 조회를 진행하지 않음
    if (!user_idx) {
      throw new Error("user_idx가 없습니다.");
    }

    // 1-3. DB 조회는 repository 계층에 위임
    // tb_profile에서 user_idx에 해당하는 프로필 데이터를 조회
    const profile = await profileRepository.findByUserIdx(user_idx);

    // 1-4. 저장된 프로필이 없는 경우 null 반환
    // controller는 null 여부에 따라 빈 프로필 상태를 응답할 수 있음
    if (!profile) {
      return null;
    }

    // 1-5. controller에게 돌려줄 프로필 조회 결과
    return profile;
  } catch (err) {
    console.log("프로필 조회 DB 에러:", err);
    throw err;
  }
};

// 2. 프로필 저장/수정 처리 함수
// 사용자 피부 조건을 추천/분석 기능에서 활용할 수 있도록 DB에 저장
const updateProfile = async (user_idx, profileData) => {
  try {
    // 2-1. user_idx 타입 검증
    // 객체가 들어오면 잘못된 호출이므로 즉시 중단
    if (typeof user_idx === "object") {
      throw new Error("user_idx에는 숫자가 들어와야 합니다.");
    }

    // 2-2. user_idx 존재 여부 검증
    // 어떤 사용자의 프로필인지 식별할 수 없으면 저장하지 않음
    if (!user_idx) {
      throw new Error("user_idx가 없습니다.");
    }

    // 2-3. 요청 body 데이터 형식 검증
    // 피부 타입, 활동 환경, 선호 제형, 기피 성분이 들어오는 객체인지 확인
    if (!profileData || typeof profileData !== "object") {
      throw new Error("profileData 형식이 올바르지 않습니다.");
    }

    // 2-4. 프론트에서 전달된 프로필 데이터 분리
    const { skin_type, activity_env, prod_type, avoid_ingredient } = profileData;

    // 2-5. 기피 성분 데이터 정규화
    // 배열로 들어온 경우 DB에 저장하기 위해 JSON 문자열로 변환
    const avoidIngredientValue = Array.isArray(avoid_ingredient)
      ? JSON.stringify(avoid_ingredient)
      : avoid_ingredient;

    // 2-6. DB 저장 모델 구성
    // repository 계층에서 그대로 INSERT/UPDATE할 수 있는 형태로 정리
    const normalizedProfileData = {
      skin_type,
      activity_env,
      prod_type,
      avoid_ingredient: avoidIngredientValue,
    };

    // 2-7. 기존 프로필 존재 여부 확인
    // user_idx 기준으로 이미 저장된 프로필이 있는지 조회
    const existingProfile =
      await profileRepository.findProfileIdxByUserIdx(user_idx);

    // 2-8. 기존 프로필이 없으면 INSERT 처리
    if (!existingProfile) {
      console.log("프로필 신규 저장 진행:", {
        user_idx,
        fields: Object.keys(normalizedProfileData),
      });

      const result = await profileRepository.createProfile(
        user_idx,
        normalizedProfileData,
      );
      const savedProfile = await profileRepository.findByUserIdx(user_idx);

      // 2-9. controller에게 돌려줄 신규 저장 결과
      return {
        action: "insert",
        profile_idx: result.insertId,
        affectedRows: result.affectedRows,
        savedProfile,
      };
    }

    // 2-10. 기존 프로필이 있으면 UPDATE 처리
    console.log("프로필 수정 진행:", {
      user_idx,
      profile_idx: existingProfile.profile_idx,
      fields: Object.keys(normalizedProfileData),
    });

    const result = await profileRepository.updateProfile(
      user_idx,
      normalizedProfileData,
    );
    const savedProfile = await profileRepository.findByUserIdx(user_idx);

    // 2-11. controller에게 돌려줄 수정 결과
    return {
      action: "update",
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
      savedProfile,
    };
  } catch (err) {
    console.log("프로필 저장/수정 DB 에러:", err);
    throw err;
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
