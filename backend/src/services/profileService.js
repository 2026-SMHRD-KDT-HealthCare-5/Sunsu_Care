// DB 연결 객체 호출
const conn = require("../db/index");

// 1. 프로필 조회 함수
const getProfile = async (user_idx, callback) => {
  try {
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

    const [rows] = await conn.query(sql, [user_idx]);

    if (rows.length === 0) {
      return callback(null, null);
    }

    return callback(null, rows[0]);
  } catch (err) {
    console.log("프로필 조회 DB 에러:", err);
    return callback(err, null);
  }
};

// 2. 프로필 저장/수정 함수
const updateProfile = async (user_idx, profileData, callback) => {
  try {
    const { skin_type, sensitivity, preferred_texture, avoid_ingredient } =
      profileData;

    // 2-1. 기존 프로필 존재 여부 확인
    const checkSql = `
      SELECT profile_idx
      FROM tb_profile
      WHERE user_id = ?
    `;

    const [rows] = await conn.query(checkSql, [user_idx]);

    // 2-2. 기존 프로필이 없는 경우 INSERT
    if (rows.length === 0) {
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
        avoid_ingredient,
      ];

      console.log("프로필 INSERT 대상 user_idx:", user_idx);
      console.log("프로필 INSERT 값:", insertValues);

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

      return callback(null, {
        action: "insert",
        profile_idx: result.insertId,
        affectedRows: result.affectedRows,
        savedProfile: insertedRows[0],
      });
    }

    // 2-3. 기존 프로필이 있는 경우 UPDATE
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
      avoid_ingredient,
      user_idx,
    ];

    console.log("프로필 UPDATE 대상 user_idx:", user_idx);
    console.log("프로필 UPDATE 값:", updateValues);

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

    return callback(null, {
      action: "update",
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
      savedProfile: updatedRows[0],
    });
  } catch (err) {
    console.log("프로필 저장/수정 DB 에러:", err);
    return callback(err, null);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};