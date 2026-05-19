<<<<<<< HEAD
// //실제 로직 처리부분 CRUD 로직 부분

// //DB 연결 객체 가져오기
// const conn = require("../db/index");

// //회원 조회 함수
// const getUsers = (name, age, callback) => {

//     //1. sql문 작성
//     let sql = "SELECT name FROM test WHERE email = ? and password=?";

//     //2. sql문 실행
//     conn.query(sql, [email,password], (err, rows) => {

        
//         callback(err, rows);

//     });

// };

// //외부에서 사용할 수 있게 내보내기
// module.exports = {
//     getUsers,
// };




// service: 실제 로그인 로직 처리 부분
// 현재는 DB 연결 전 테스트 단계이므로 mock 데이터를 반환한다.

// 로그인 처리 함수
const login = (email, password, callback) => {
  // 1. 입력값 검증
  if (!email || !password) {
    return callback(null, {
      success: false,
      message: "이메일과 비밀번호를 입력해주세요.",
    });
  }

  // 2. 테스트용 로그인 성공 응답 생성
  // 프론트 authApi.js의 mock 응답 구조와 맞춤
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

// 외부에서 login 함수를 사용할 수 있도록 내보내기
module.exports = {
  login,
=======
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
>>>>>>> main
};