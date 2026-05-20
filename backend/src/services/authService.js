// DB 연결 객체 호출
const conn = require("../db/index");

// 비밀번호 암호화 라이브러리
const bcrypt = require("bcrypt");

// JWT 토큰 라이브러리
const jwt = require("jsonwebtoken");

// 암호화 강도
const SALT_ROUNDS = 10;

// 1. 회원가입 처리 함수
const signup = async (email, password, nickname, callback) => {
  try {
    // 1-1. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 1-2. SQL문 작성
    const sql = `
      INSERT INTO tb_user
      (email, password_hash, nickname, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    // 1-3. SQL문 실행
    conn.query(sql, [email, hashedPassword, nickname, "user"], (err, rows) => {
      if (err) {
        console.log("회원가입 DB 저장 에러:", err);
        return callback(err, null);
      }

      return callback(null, rows);
    });
  } catch (err) {
    console.log("비밀번호 암호화 에러:", err);
    return callback(err, null);
  }
};

// 2. 로그인 처리 함수
const login = (email, password, callback) => {
  // 2-1. 이메일 기준으로 사용자 조회
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

  conn.query(sql, [email], async (err, rows) => {
    if (err) {
      console.log("로그인 DB 조회 에러:", err);
      return callback(err, null);
    }

    // 2-2. 이메일에 해당하는 사용자가 없는 경우
    if (rows.length === 0) {
      return callback(null, {
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const user = rows[0];

    try {
      // 2-3. 입력한 비밀번호와 DB의 암호화된 비밀번호 비교
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return callback(null, {
          success: false,
          message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        });
      }

      // 2-4. JWT 토큰 생성
      const token = jwt.sign(
        {
          user_idx: user.user_idx,
          email: user.email,
          nickname: user.nickname,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      // 2-5. 로그인 성공 결과를 controller로 전달
      return callback(null, {
        success: true,
        message: "로그인 성공",
        token,
        user: {
          user_idx: user.user_idx,
          email: user.email,
          nickname: user.nickname,
          role: user.role,
        },
      });
    } catch (err) {
      console.log("비밀번호 비교 또는 토큰 생성 에러:", err);
      return callback(err, null);
    }
  });
};

// 3. 로그아웃 처리 함수
const logout = (callback) => {
  try {
    // JWT 방식에서는 서버에서 토큰을 직접 삭제하지 않음
    // 프론트에서 localStorage에 저장된 authToken을 삭제하면 로그아웃 처리
    return callback(null, {
      success: true,
      message: "로그아웃 성공",
    });
  } catch (err) {
    console.log("로그아웃 처리 에러:", err);
    return callback(err, null);
  }
};

module.exports = {
  signup,
  login,
  logout,
};