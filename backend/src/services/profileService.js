// DB 연결 객체 호출
const conn = require("../db/index");

// 1. 프로필 조회 함수
// async: 함수 내부에서 await를 사용할 수 있게 해주는 키워드
const getProfile = async (user_idx) => {
  try {
    console.log("===== 프로필 조회 service 진입 =====")
    console.log("getProfile service user_idx:", user_idx);
    console.log("getProfile service user_idx 타입:", typeof user_idx);

    // user_idx가 객체로 들어온 경우를 미리 차단
    if (typeof user_idx === "object") {
      console.log("getProfile 실패: user_idx에 객체가 들어옴:", user_idx);
      throw new Error("user_idx에는 숫자가 들어와야 합니다. req.user 전체가 아니라 req.user.user_idx를 넘겨야 합니다.");
    }

    if (!user_idx) {
      console.log("getProfile 실패: user_idx 없음");
      throw new Error("user_idx가 없습니다.");
    }

    const sql = `
      SELECT
        profile_idx,
        user_id,
        skin_type,
        senstive_yn,
        prod_type,
        avoid_ingredient,
        joined_at,
        updated_at
      FROM tb_profile
      WHERE user_id = ?
    `;

    console.log("프로필 조회 SQL 실행 직전");
    console.log("프로필 조회 SQL 값:", [user_idx]);

    const [rows] = await conn.query(sql, [user_idx]);

    console.log("프로필 조회 DB 결과 rows:", rows);

    if (rows.length === 0) {
      console.log("프로필 조회 결과 없음");
      return null;
    }

    console.log("프로필 조회 결과 있음:", rows[0]);

    return rows[0];
  } catch (err) {
    console.log("프로필 조회 DB 에러:", err);
    console.log("프로필 조회 DB 에러 message:", err.message);
    console.log("프로필 조회 DB 에러 code:", err.code);

    // callback 방식 제거에 따라 에러를 throw해서 controller의 catch에서 처리함
    throw err;
  }
};

// 2. 프로필 저장/수정 함수
// async: 함수 내부에서 await를 사용할 수 있게 해주는 키워드
const updateProfile = async (user_idx, profileData) => {
  try {
    console.log("===== 프로필 저장/수정 service 진입 =====")
    console.log("updateProfile service user_idx:", user_idx);
    console.log("updateProfile service user_idx 타입:", typeof user_idx);
    console.log("updateProfile service profileData:", profileData);
    console.log("updateProfile service profileData 타입:", typeof profileData);

    // user_idx가 객체로 들어온 경우를 미리 차단
    if (typeof user_idx === "object") {
      console.log("updateProfile 실패: user_idx에 객체가 들어옴:", user_idx);
      throw new Error("user_idx에는 숫자가 들어와야 합니다. req.user 전체가 아니라 req.user.user_idx를 넘겨야 합니다.");
    }

    if (!user_idx) {
      console.log("updateProfile 실패: user_idx 없음");
      throw new Error("user_idx가 없습니다.");
    }

    if (!profileData || typeof profileData !== "object") {
      console.log("updateProfile 실패: profileData가 객체가 아님:", profileData);
      throw new Error("profileData 형식이 올바르지 않습니다.");
    }

    const { skin_type, sensitivity, preferred_texture, avoid_ingredient } =
      profileData;

    console.log("분해한 profileData:", {
      skin_type,
      sensitivity,
      preferred_texture,
      avoid_ingredient,
    });

    console.log("분해한 profileData 타입:", {
      skin_type: typeof skin_type,
      sensitivity: typeof sensitivity,
      preferred_texture: typeof preferred_texture,
      avoid_ingredient: typeof avoid_ingredient,
    });

    // avoid_ingredient가 배열이면 DB 저장을 위해 JSON 문자열로 변환
    // 프론트에서는 배열로 관리하고, DB에는 문자열로 저장하는 구조를 맞추기 위함
    const avoidIngredientValue = Array.isArray(avoid_ingredient)
      ? JSON.stringify(avoid_ingredient)
      : avoid_ingredient;

    console.log("DB 저장용 avoidIngredientValue:", avoidIngredientValue);
    console.log("DB 저장용 avoidIngredientValue 타입:", typeof avoidIngredientValue);

    // 2-1. 기존 프로필 존재 여부 확인
    const checkSql = `
      SELECT profile_idx
      FROM tb_profile
      WHERE user_id = ?
    `;

    console.log("기존 프로필 존재 여부 확인 SQL 실행 직전");
    console.log("기존 프로필 존재 여부 확인 값:", [user_idx]);

    const [rows] = await conn.query(checkSql, [user_idx]);

    console.log("기존 프로필 조회 결과:", rows);

    // 2-2. 기존 프로필이 없는 경우 INSERT
    if (rows.length === 0) {
      console.log("기존 프로필 없음 → INSERT 진행");

      const insertSql = `
        INSERT INTO tb_profile
        (
          user_id,
          skin_type,
          senstive_yn,
          prod_type,
          avoid_ingredient,
          joined_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const insertValues = [
        user_idx,
        skin_type,
        sensitivity,
        preferred_texture,
        avoidIngredientValue,
      ];

      console.log("프로필 INSERT 대상 user_idx:", user_idx);
      console.log("프로필 INSERT 값:", insertValues);
      console.log("프로필 INSERT 값 타입:", insertValues.map((value) => typeof value));

      const [result] = await conn.query(insertSql, insertValues);

      console.log("프로필 INSERT 결과:", result);

      const [insertedRows] = await conn.query(
        `
        SELECT
          profile_idx,
          user_id,
          skin_type,
          senstive_yn,
          prod_type,
          avoid_ingredient,
          joined_at,
          updated_at
        FROM tb_profile
        WHERE user_id = ?
        `,
        [user_idx]
      );

      console.log("INSERT 직후 DB 조회 결과:", insertedRows);

      return {
        action: "insert",
        profile_idx: result.insertId,
        affectedRows: result.affectedRows,
        savedProfile: insertedRows[0],
      };
    }

    // 2-3. 기존 프로필이 있는 경우 UPDATE
    console.log("기존 프로필 있음 → UPDATE 진행");

    const updateSql = `
      UPDATE tb_profile
      SET
        skin_type = ?,
        senstive_yn = ?,
        prod_type = ?,
        avoid_ingredient = ?,
        updated_at = NOW()
      WHERE user_id = ?
    `;

    const updateValues = [
      skin_type,
      sensitivity,
      preferred_texture,
      avoidIngredientValue,
      user_idx,
    ];

    console.log("프로필 UPDATE 대상 user_idx:", user_idx);
    console.log("프로필 UPDATE 값:", updateValues);
    console.log("프로필 UPDATE 값 타입:", updateValues.map((value) => typeof value));

    const [result] = await conn.query(updateSql, updateValues);

    console.log("프로필 UPDATE 결과:", result);

    const [updatedRows] = await conn.query(
      `
      SELECT
        profile_idx,
        user_id,
        skin_type,
        senstive_yn,
        prod_type,
        avoid_ingredient,
        joined_at,
        updated_at
      FROM tb_profile
      WHERE user_id = ?
      `,
      [user_idx]
    );

    console.log("UPDATE 직후 DB 조회 결과:", updatedRows);

    return {
      action: "update",
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
      savedProfile: updatedRows[0],
    };
  } catch (err) {
    console.log("프로필 저장/수정 DB 에러:", err);
    console.log("프로필 저장/수정 DB 에러 message:", err.message);
    console.log("프로필 저장/수정 DB 에러 code:", err.code);

    // callback 방식 제거에 따라 에러를 throw해서 controller의 catch에서 처리함
    throw err;
  }
};

module.exports = {
  getProfile,
  updateProfile,
};