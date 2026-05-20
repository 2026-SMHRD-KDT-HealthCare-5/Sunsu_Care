// DB 연결 객체 호출
const conn = require("../db/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;

// 1. 회원가입 처리 함수 (HEAD에서 가져옴 - DB 연동)
const signup = async (email, password, nickname, callback) => {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const sql = `INSERT INTO tb_user (email, password_hash, nickname, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`;
    
    const [rows] = await conn.query(sql, [email, hashedPassword, nickname, "user"]);
    return callback(null, {
      success: true,
      status: 201,
      message: "회원가입 성공",
      user: { user_idx: rows.insertId, email, nickname, role: "user" },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return callback(null, { success: false, status: 409, message: "이미 사용 중인 이메일입니다." });
    }
    return callback(err, null);
  }
};

// 2. 로그인 처리 함수 (HEAD의 실제 DB 로직 사용)
const login = async (email, password, callback) => {
  try {
    const sql = `SELECT user_idx, email, password_hash, nickname, role FROM tb_user WHERE email = ?`;
    const [rows] = await conn.query(sql, [email]);

    if (rows.length === 0) {
      return callback(null, { success: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return callback(null, { success: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const token = jwt.sign(
      { user_idx: user.user_idx, email: user.email, nickname: user.nickname, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return callback(null, { success: true, message: "로그인 성공", token, user });
  } catch (err) {
    return callback(err, null);
  }
};

// 3. 로그아웃 처리 함수 (HEAD에서 유지 - 기능 손실 방지)
const logout = (callback) => {
  try {
    return callback(null, { success: true, message: "로그아웃 성공" });
  } catch (err) {
    return callback(err, null);
  }
};

module.exports = {
  signup,
  login,
  logout, // 이 기능이 반드시 있어야 합니다.
};