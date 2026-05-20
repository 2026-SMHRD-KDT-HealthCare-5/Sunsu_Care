// controller: 요청 받기 -> service 호출 -> 응답 내보내기

const authService = require("../services/authService");

// 1. 회원가입 API 요청 처리
const signup = (req, res) => {
  const { email, password, nickname } = req.body;

  // 1-1. 입력값 검증 
  if (!email || !password || !nickname) {
    // 400: 요청값 오류
    // .json(): 응답 데이터 json 형태로 출력
    return res.status(400).json({
      success: false,
      message: "이메일, 비밀번호, 닉네임을 모두 입력하세요",
    });
  }

  // authService의 signup 함수에 매개변수 값 넘겨서 DB에 저장/처리
  // 수정한 이유:
  // service에서 success, status, message, user 형태의 최종 응답 객체를 만들어 넘기기 때문에
  // controller에서는 result를 그대로 응답으로 내보내면 됨
  authService.signup(email, password, nickname, (err, result) => {
    if (err) {
      console.log("회원가입 에러:", err);

      // DB/서버 에러 검출 (500: 서버 내부 오류)
      return res.status(500).json({
        success: false,
        message: "회원가입 실패",
        error: err.message,
      });
    }

    // 수정한 이유:
    // 회원가입 성공은 201, 이메일 중복은 409처럼
    // service에서 넘겨준 status 값에 따라 응답 상태코드를 결정함
    return res.status(result.status).json(result);
  });
};

// 2. 로그인 API 요청 처리
const login = (req, res) => {
  const { email, password } = req.body;

  // 2-1. 입력값 검증
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "이메일과 비밀번호를 모두 입력하세요",
    });
  }

  // authService의 login 함수에 매개변수 값 넘겨서 DB에 저장/처리
  authService.login(email, password, (err, result) => {
    if (err) {
      console.log("로그인 에러:", err);

      return res.status(500).json({
        success: false,
        message: "로그인 실패",
        error: err.message,
      });
    }

    // 이메일 또는 비밀번호가 틀린 경우
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }

    // 로그인 성공 응답
    return res.status(200).json({
      success: true,
      message: "로그인 성공",
      user: result.user,
      token: result.token,
    });
  });
};

// 3. 로그아웃 API 요청 처리
const logout = (req, res) => {
  authService.logout((err, result) => {
    if (err) {
      console.log("로그아웃 에러:", err);

      return res.status(500).json({
        success: false,
        message: "로그아웃 실패",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  });
};

module.exports = {
  signup,
  login,
  logout,
};