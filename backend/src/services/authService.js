// service: 실제 회원가입 및 로그인 로직을 처리하는 파일

// DB 연결 객체 호출
const conn = require("../db/index");

// 1. 로그인 처리 함수 (프론트 연동 테스트용 Mock 데이터 반환)
const login = (email, password, callback) => {
  // 1. 입력값 검증
  if (!email || !password) {
    return callback(null, {
      success: false,
      message: "이메일과 비밀번호를 입력해주세요.",
    });
  }

  // 2. 테스트용 로그인 성공 응답 생성
  const result = {
    success: true,
    message: "로그인 성공",
    token: "mock-token-" + Date.now(),
    user: {
      user_idx: 1,
      email: email,
      name: "Mock 사용자",
      role: "user",
    },
  };

  // 3. controller로 결과 전달
  return callback(null, result);
};

// 2. 회원가입 처리 함수
const signup = (email, password, nickname, callback) => {
  // SQL문 작성
  const sql = `
    INSERT INTO tb_user
    (email, password_hash, nickname, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, NOW(), NOW())
  `;

  // SQL문 실행
  conn.query(sql, [email, password, nickname, "user"], (err, rows) => {
    // 회원가입 정보 DB에 insert 성공
    if (!err) {
      // 회원가입 성공 응답 객체 생성
      const result = {
        success: true,
        message: "회원가입 성공",
        // 회원가입된 사용자 정보
        user: {
          user_idx: rows.insertId,
          email: email,
          nickname: nickname,
          role: "user",
        },
      };
      // 회원가입 처리 로직 controller로 넘기는 부분
      callback(null, result);
    } 
    // 회원가입 정보 DB에 insert 실패
    else {
      callback(err, null);
    }
  });
};

// 외부에서 함수들을 사용할 수 있도록 내보내기
module.exports = {
  login,
  signup,
};