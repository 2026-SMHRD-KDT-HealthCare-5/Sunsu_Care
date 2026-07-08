const conn = require("../db");

const findByUserIdx = async (userIdx) => {
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

  const [rows] = await conn.query(sql, [userIdx]);
  return rows[0] || null;
};

const findProfileIdxByUserIdx = async (userIdx) => {
  const sql = `
    SELECT profile_idx
    FROM tb_profile
    WHERE user_id = ?
  `;

  const [rows] = await conn.query(sql, [userIdx]);
  return rows[0] || null;
};

const createProfile = async (userIdx, profileData) => {
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

  const [result] = await conn.query(sql, [
    userIdx,
    profileData.skin_type,
    profileData.activity_env,
    profileData.prod_type,
    profileData.avoid_ingredient,
  ]);

  return result;
};

const updateProfile = async (userIdx, profileData) => {
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
