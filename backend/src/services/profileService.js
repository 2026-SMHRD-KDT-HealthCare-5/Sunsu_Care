// DB 연결 객체 호출
const conn = require("../db/index");

// 1. 프로필 조회 함수
const getProfile = (user_idx, callback) => {
  // 1-1. SQL문 작성
  const sql = `
    SELECT
      profile_idx,
      user_idx,
      skin_type,
      sensitivity,
      preferred_texture,
      avoid_ingredient,
      created_at,
      updated_at
    FROM tb_profile
    WHERE user_idx = ?
  `;

  // 1-2. SQL문 실행
  conn.query(sql, [user_idx], (err, rows) => {
    if (err) {
      console.log("프로필 조회 DB 에러:", err);
      return callback(err, null);
    }

    // 조회된 프로필이 없는 경우
    if (rows.length === 0) {
      return callback(null, null);
    }

    // 조회된 프로필 1개 반환
    return callback(null, rows[0]);
  });
};

// 2. 프로필 저장/수정 함수
const updateProfile = (user_idx, profileData, callback) => {
  // 2-1. 프론트에서 전달받은 프로필 데이터 꺼내기
  const {
    skin_type,
    sensitivity,
    preferred_texture,
    avoid_ingredient,
  } = profileData;

  // 2-2. 기존 프로필 존재 여부 확인 SQL
  const checkSql = `
    SELECT profile_idx
    FROM tb_profile
    WHERE user_idx = ?
  `;

  conn.query(checkSql, [user_idx], (err, rows) => {
    if (err) {
      console.log("프로필 존재 여부 확인 DB 에러:", err);
      return callback(err, null);
    }

    // 2-3. 기존 프로필이 없는 경우 INSERT
    if (rows.length === 0) {
      const insertSql = `
        INSERT INTO tb_profile
        (
          user_idx,
          skin_type,
          sensitivity,
          preferred_texture,
          avoid_ingredient,
          created_at,
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

      conn.query(insertSql, insertValues, (err, result) => {
        if (err) {
          console.log("프로필 등록 DB 에러:", err);
          return callback(err, null);
        }

        return callback(null, {
          action: "insert",
          profile_idx: result.insertId,
          affectedRows: result.affectedRows,
        });
      });

      return;
    }

    // 2-4. 기존 프로필이 있는 경우 UPDATE
    const updateSql = `
      UPDATE tb_profile
      SET
        skin_type = ?,
        sensitivity = ?,
        preferred_texture = ?,
        avoid_ingredient = ?,
        updated_at = NOW()
      WHERE user_idx = ?
    `;

    const updateValues = [
      skin_type,
      sensitivity,
      preferred_texture,
      avoid_ingredient,
      user_idx,
    ];

    conn.query(updateSql, updateValues, (err, result) => {
      if (err) {
        console.log("프로필 수정 DB 에러:", err);
        return callback(err, null);
      }

      return callback(null, {
        action: "update",
        affectedRows: result.affectedRows,
      });
    });
  });
};

module.exports = {
  getProfile,
  updateProfile,
};