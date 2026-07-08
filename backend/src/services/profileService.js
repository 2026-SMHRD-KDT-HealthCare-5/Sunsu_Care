// backend/src/services/profileService.js
const profileRepository = require("../repositories/profileRepository");

const getProfile = async (user_idx) => {
  try {
    console.log("===== 프로필 조회 service 진입 =====");
    console.log("getProfile service user_idx:", user_idx);

    if (typeof user_idx === "object") {
      throw new Error("user_idx에는 숫자가 들어와야 합니다.");
    }

    if (!user_idx) {
      throw new Error("user_idx가 없습니다.");
    }

    const profile = await profileRepository.findByUserIdx(user_idx);

    if (!profile) {
      console.log("프로필 조회 결과 없음");
      return null;
    }

    return profile;
  } catch (err) {
    console.log("프로필 조회 DB 에러:", err);
    throw err;
  }
};

const updateProfile = async (user_idx, profileData) => {
  try {
    console.log("===== 프로필 저장/수정 service 진입 =====");

    if (typeof user_idx === "object") {
      throw new Error("user_idx에는 숫자가 들어와야 합니다.");
    }

    if (!user_idx) {
      throw new Error("user_idx가 없습니다.");
    }

    if (!profileData || typeof profileData !== "object") {
      throw new Error("profileData 형식이 올바르지 않습니다.");
    }

    const { skin_type, activity_env, prod_type, avoid_ingredient } = profileData;

    console.log("분해한 profileData:", {
      skin_type,
      activity_env,
      prod_type,
      avoid_ingredient,
    });

    const avoidIngredientValue = Array.isArray(avoid_ingredient)
      ? JSON.stringify(avoid_ingredient)
      : avoid_ingredient;

    const normalizedProfileData = {
      skin_type,
      activity_env,
      prod_type,
      avoid_ingredient: avoidIngredientValue,
    };

    const existingProfile =
      await profileRepository.findProfileIdxByUserIdx(user_idx);

    if (!existingProfile) {
      console.log("기존 프로필 없음 → INSERT 진행");

      const result = await profileRepository.createProfile(
        user_idx,
        normalizedProfileData,
      );
      const savedProfile = await profileRepository.findByUserIdx(user_idx);

      return {
        action: "insert",
        profile_idx: result.insertId,
        affectedRows: result.affectedRows,
        savedProfile,
      };
    }

    console.log("기존 프로필 있음 → UPDATE 진행");

    const result = await profileRepository.updateProfile(
      user_idx,
      normalizedProfileData,
    );
    const savedProfile = await profileRepository.findByUserIdx(user_idx);

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
