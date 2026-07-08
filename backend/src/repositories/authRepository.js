const conn = require("../db");

// CREATE: 회원가입 시 새 사용자 정보를 DB에 저장
const createUser = async ({ email, passwordHash, nickname, role = "user" }) => {
  // 1. 사용자 INSERT SQL 작성
  const sql = `
    INSERT INTO tb_user
    (email, password_hash, nickname, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, NOW(), NOW())
  `;

  // 2. SQL 실행 후 INSERT 결과 반환
  const [result] = await conn.query(sql, [
    email,
    passwordHash,
    nickname,
    role,
  ]);

  return result;
};

// READ: 로그인 시 이메일로 사용자 정보 조회
const findByEmail = async (email) => {
  // 1. 이메일 기준 사용자 SELECT SQL 작성
  const sql = `
    SELECT 
      user_idx,
      email,
      password_hash,
      nickname,
      role
    FROM tb_user
    WHERE email = ?
  `;

  // 2. SQL 실행 후 첫 번째 사용자만 반환
  const [rows] = await conn.query(sql, [email]);
  return rows[0] || null;
};

// UPDATE: 로그인 사용자의 닉네임 변경
const updateNickname = async (userIdx, nickname) => {
  // 1. 닉네임 UPDATE SQL 작성
  const sql = `
    UPDATE tb_user
    SET nickname = ?, updated_at = NOW()
    WHERE user_idx = ? AND deleted_at IS NULL
  `;

  // 2. SQL 실행 후 변경 결과 반환
  const [result] = await conn.query(sql, [nickname, userIdx]);
  return result;
};

// READ: 비밀번호 변경 전 현재 비밀번호 해시 조회
const findPasswordHashByUserIdx = async (userIdx) => {
  // 1. 사용자 PK 기준 password_hash SELECT SQL 작성
  const sql = `
    SELECT password_hash
    FROM tb_user
    WHERE user_idx = ? AND deleted_at IS NULL
  `;

  // 2. SQL 실행 후 비밀번호 해시 정보 반환
  const [rows] = await conn.query(sql, [userIdx]);
  return rows[0] || null;
};

// UPDATE: 검증 완료 후 새 비밀번호 해시 저장
const updatePassword = async (userIdx, passwordHash) => {
  // 1. 비밀번호 UPDATE SQL 작성
  const sql = `
    UPDATE tb_user
    SET password_hash = ?, updated_at = NOW()
    WHERE user_idx = ?
  `;

  // 2. SQL 실행 후 변경 결과 반환
  const [result] = await conn.query(sql, [passwordHash, userIdx]);
  return result;
};

// DELETE: 실제 삭제 대신 deleted_at을 기록하는 소프트 삭제
const softDeleteByUserIdx = async (userIdx) => {
  // 1. 회원 탈퇴 처리를 위한 deleted_at UPDATE SQL 작성
  const sql = `
    UPDATE tb_user
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE user_idx = ? AND deleted_at IS NULL
  `;

  // 2. SQL 실행 후 변경 결과 반환
  const [result] = await conn.query(sql, [userIdx]);
  return result;
};

module.exports = {
  createUser,
  findByEmail,
  updateNickname,
  findPasswordHashByUserIdx,
  updatePassword,
  softDeleteByUserIdx,
};
