// backend/src/services/profileService.js
// DB 연결 객체 호출
const conn = require("../db/index");

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

    const sql = `
      SELECT
        profile_idx,
        user_id,
        skin_type,
        activity_env, 
        prod_type,
        avoid_ingredient,
        joined_at,
        updated_at
      FROM tb_profile
      WHERE user_id = ?
    `;

    console.log("프로필 조회 SQL 실행 직전");
    const [rows] = await conn.query(sql, [user_idx]);

    if (rows.length === 0) {
      console.log("프로필 조회 결과 없음");
      return null;
    }

    return rows[0];
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

    const checkSql = `
      SELECT profile_idx
      FROM tb_profile
      WHERE user_id = ?
    `;
    const [rows] = await conn.query(checkSql, [user_idx]);

    if (rows.length === 0) {
      console.log("기존 프로필 없음 → INSERT 진행");

      const insertSql = `
        INSERT INTO tb_profile
        (
          user_id,
          skin_type,
          activity_env,
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
        activity_env,
        prod_type,
        avoidIngredientValue,
      ];

      const [result] = await conn.query(insertSql, insertValues);

      const [insertedRows] = await conn.query(
        `
        SELECT
          profile_idx,
          user_id,
          skin_type,
          activity_env,
          prod_type,
          avoid_ingredient,
          joined_at,
          updated_at
        FROM tb_profile
        WHERE user_id = ?
        `,
        [user_idx]
      );

      return {
        action: "insert",
        profile_idx: result.insertId,
        affectedRows: result.affectedRows,
        savedProfile: insertedRows[0],
      };
    }

    console.log("기존 프로필 있음 → UPDATE 진행");

    const updateSql = `
      UPDATE tb_profile
      SET
        skin_type = ?,
        activity_env = ?,
        prod_type = ?,
        avoid_ingredient = ?,
        updated_at = NOW()
      WHERE user_id = ?
    `;

    const updateValues = [
      skin_type,
      activity_env,
      prod_type,
      avoidIngredientValue,
      user_idx,
    ];

    const [result] = await conn.query(updateSql, updateValues);

    const [updatedRows] = await conn.query(
      `
      SELECT
        profile_idx,
        user_id,
        skin_type,
        activity_env,
        prod_type,
        avoid_ingredient,
        joined_at,
        updated_at
      FROM tb_profile
      WHERE user_id = ?
      `,
      [user_idx]
    );

    return {
      action: "update",
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
      savedProfile: updatedRows[0],
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