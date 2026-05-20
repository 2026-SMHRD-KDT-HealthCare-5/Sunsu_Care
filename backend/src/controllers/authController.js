// controller: 요청 받기 -> service 호출 -> 응답 내보내기

const authService = require("../services/authService");

// 1. 회원가입 API 요청 처리
const signup = (req, res) => {
  const { email, password, nickname } = req.body;

  // 1-1. 입력값 검증 
  if (!email || !password || !nickname) 
  {
    //400: 요청값 오류
    //.json(): 응답 데이터 json 형태로 출력
    return res.status(400).json( //
      {
      success: false,
      message: "이메일, 비밀번호, 닉네임을 모두 입력하세요",
      }
    );
  }

  // authService의 signup 함수에 매개변수 값 넘겨서 DB에 저장/처리
  authService.signup(email, password, nickname, (err, rows) => {
    if (err) {
      console.log("회원가입 에러:", err);

      // 중복 이메일 에러
      if (err.code === "ER_DUP_ENTRY") 
      {
          //409: 데이터 충돌 
          return res.status(409).json(
          {
            success: false,
            message: "이미 사용 중인 이메일입니다.",
          }
        );
      }

      //DB/서버 에레 검출  (500: 서버 내부 오류)
      return res.status(500).json({
        success: false,
        message: "회원가입 실패",
        error: err.message,
      });
    }

    // 회원가입 성공 응답 (201: 성공 실행)
    return res.status(201).json({
      success: true,
      message: "회원가입 성공",
      user: {
        user_idx: rows.insertId,
        email,
        nickname,
        role: "user",
      },
    });
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