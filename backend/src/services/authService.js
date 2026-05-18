// service: 실제 회원가입 로직을 처리하는 파일

// DB 연결 객체 호출
const conn = require("../db/index");

// 회원가입 처리 함수 선언
// controller에서 email, password, nickname을 전달받고,
// 처리 결과는 callback으로 다시 controller에 넘김
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

      //회원가입 성공 응답 객체 생성
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
      //회원가입 처리 로직 controller로 넘기는 부분 => callback(에러, 결과)
      callback(null, result);
    } 
    // 회원가입 정보 DB에 insert 실패
    else {
      callback(err, null);
    }
  });
};

// signup 함수를 다른 파일에서 사용할 수 있도록 내보내기
module.exports = {
  signup,
};