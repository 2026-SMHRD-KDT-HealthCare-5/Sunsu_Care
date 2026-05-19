//controller: 요청 받기 ->server 호출 -> 응답 내보내기

//회원가입 요청에 해당하는 authService 로직 호출
const authService = require("../services/authService");

//1. 회원가입 API 요청처리
const signup = (req, res) => {
  //Post로 받아온 세 가지 데이터 가져오기
  const {email, password, nickname} = req.body;

  // 입력값 검증
  if (!email || !password || !nickname) {
    //400 상태코드와 실패 응답 출력
    return res.status(400).json({
      success: false,
      message: "이메일, 비밀번호, 닉네임을 모두 입력하세요",
    });
  }

  //authService의 signup 함수 호출
  authService.signup(email, password, nickname, (err, result) => {
    //에러가 없으면 회원가입 성공 응답 출력
    if (!err) {
      res.status(201).json({
        success: true,
        message: "회원가입 성공",
      });
    }
    //에러 발생시 회원가입 실패 응답 출력
    else {
      //서버 콘솔에 에러 내용 출력
      console.log(err);
      res.status(400).json({
        success: false,
        message: "회원가입 실패",
      });
    }
  });
};

//getUsers함수를 다른 파일에서 사용할 수 있게 내보내기
module.exports = { signup };
