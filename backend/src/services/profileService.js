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
        joined_at
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

    const checkSql = `
      SELECT profile_idx
      FROM tb_profile
      WHERE user_id = ?
    `;

    const [rows] = await conn.query(checkSql, [user_idx]);

    if (rows.length === 0) {
      const insertSql = `
        INSERT INTO tb_profile
        (
          user_id,
          skin_type,
          senstive_yn,
          prod_type,
          avoid_ingredient,
          joined_at
        )
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      const insertValues = [
        user_idx,
        skin_type,
        sensitivity,
        preferred_texture,
        avoid_ingredient,
      ];

      const [result] = await conn.query(insertSql, insertValues);

      return callback(null, {
        action: "insert",
        profile_idx: result.insertId,
        affectedRows: result.affectedRows,
      });
    }

    const updateSql = `
      UPDATE tb_profile
      SET
        skin_type = ?,
        senstive_yn = ?,
        prod_type = ?,
        avoid_ingredient = ?
      WHERE user_id = ?
    `;

    const updateValues = [
      skin_type,
      sensitivity,
      preferred_texture,
      avoid_ingredient,
      user_idx,
    ];

    const [result] = await conn.query(updateSql, updateValues);

    return callback(null, {
      action: "update",
      affectedRows: result.affectedRows,
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
