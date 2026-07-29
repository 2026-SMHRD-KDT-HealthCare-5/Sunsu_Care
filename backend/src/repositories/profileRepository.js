const conn = require("../db");

// READ: 로그인 사용자의 프로필 정보 조회
const findByUserIdx = async (userIdx) => {
  // 1. 사용자 PK 기준 프로필 SELECT SQL 작성
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

  // 2. SQL 실행 후 첫 번째 프로필만 반환
  const [rows] = await conn.query(sql, [userIdx]);
  return rows[0] || null;
};

// READ: 프로필 저장/수정 전 기존 프로필 존재 여부 확인
const findProfileIdxByUserIdx = async (userIdx) => {
  // 1. 사용자 PK 기준 profile_idx SELECT SQL 작성
  const sql = `
    SELECT profile_idx
    FROM tb_profile
    WHERE user_id = ?
  `;

  // 2. SQL 실행 후 기존 프로필 식별값 반환
  const [rows] = await conn.query(sql, [userIdx]);
  return rows[0] || null;
};

// CREATE: 최초 프로필 등록 시 사용자 프로필 정보를 DB에 저장
const createProfile = async (userIdx, profileData) => {
  // 1. 프로필 INSERT SQL 작성
  const sql = `
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

  // 2. SQL 실행 후 INSERT 결과 반환
  const [result] = await conn.query(sql, [
    userIdx,
    profileData.skin_type,
    profileData.activity_env,
    profileData.prod_type,
    profileData.avoid_ingredient,
  ]);

  return result;
};

// UPDATE: 기존 프로필이 있는 사용자의 프로필 정보 수정
const updateProfile = async (userIdx, profileData) => {
  // 1. 프로필 UPDATE SQL 작성
  const sql = `
    UPDATE tb_profile
    SET
      skin_type = ?,
      activity_env = ?,
      prod_type = ?,
      avoid_ingredient = ?,
      updated_at = NOW()
    WHERE user_id = ?
  `;

  // 2. SQL 실행 후 변경 결과 반환
  const [result] = await conn.query(sql, [
    profileData.skin_type,
    profileData.activity_env,
    profileData.prod_type,
    profileData.avoid_ingredient,
    userIdx,
  ]);

  return result;
};

module.exports = {
  findByUserIdx,
  findProfileIdxByUserIdx,
  createProfile,
  updateProfile,
};
