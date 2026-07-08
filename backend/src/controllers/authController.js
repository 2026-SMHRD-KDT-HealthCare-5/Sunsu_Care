// authService 함수 호출
const authService = require("../services/authService");

// 1. 회원가입 API 요청 처리
const signup = async (req, res, next) => {
  try {
    // 1-1. 요청 body에서 값 꺼내 변수에 저장
    const { email, password, nickname } = req.body;

    // 1-2. 입력값 검증
    if (!email || !password || !nickname) {

      // 누락된 입력값 확인 로그 (if 조건 true -> 값 누락)
      console.log("회원가입 입력값 누락:", {
        email: !!email,
        password: !!password,
        nickname: !!nickname,
      });

      // 누락된 입력값을 클라이언트로 응답
      return res.status(400).json({
        success: false,
        message: "이메일, 비밀번호, 닉네임을 모두 입력하세요",
      });
    }
    // 1-3. 회원가입 처리 전에 요청 값 확인 (if 조건 false -> 값 모두 있음)
    console.log("요청 값 확인:", {
      email,
      nickname,
      passwordLength: password.length,
    });

    // 1-4. service의 회원가입 처리 결과를 기다린 후 저장
    const result = await authService.signup(email, password, nickname);

    // 1-5. 서버 확인용 로그
    console.log("회원가입 API 결과:", result);
    console.log("회원가입 응답 상태:", result.status);

    // 1-6. HTTP 상태 코드와 JSON 형태로 클라이언트에 응답
    return res.status(result.status).json(result);
  } catch (err) {

    // 1-7. 서버/DB 에러 확인
    console.log("회원가입 에러:", err); // 에러 전체 정보
    console.log("회원가입 에러 message:", err.message); // 에러 문장
    console.log("회원가입 에러 code:", err.code); // 에러 종류 코드

    // 1-8. DB/서버 에러는 app.js의 전역 에러 처리 미들웨어로 전달
    const error = new Error("회원가입 실패");
    error.status = 500;
    return next(error); // app.js의 전역 에러 처리 미들웨어로 전달
  }
};

// 2. 로그인 API 요청 처리
const login = async (req, res, next) => {
  try {
    // 2-1. 요청 body에서 값 꺼내 변수에 저장
    const { email, password } = req.body;

    // 2-2. 입력값 검증
    if (!email || !password) {
      // 누락된 입력값 확인 로그 (if 조건 true -> 값 누락)
      console.log("로그인 입력값 누락:", {
        email: !!email,
        password: !!password,
      });

      // 누락된 입력값을 클라이언트로 응답
      return res.status(400).json({
        success: false,
        message: "이메일과 비밀번호를 모두 입력하세요",
      });
    }
    // 2-3. 로그인 처리 전에 요청 값 확인 (if 조건 false -> 값 모두 있음)
    console.log("요청 값 확인:", {
      email,
      passwordLength: password.length,
    });

    // 2-4. service의 로그인 처리 결과를 기다린 후 저장
    const result = await authService.login(email, password);

    // 2-5. 서버 확인용 로그
    console.log("로그인 API 결과:", result);
    console.log("로그인 응답 상태:", result.status);

    // 2-6. 로그인 정보 틀린 경우
    if (!result.success) {
      // 서버 확인용 로그
      console.log("로그인 실패:", result);

      // HTTP 상태 코드와 JSON 형태로 클라이언트에 응답
      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }

    // 2-7. 로그인 성공 시 서버 확인용 로그
    console.log("로그인 성공:", {
      user_idx: result.user?.user_idx,
      hasToken: !!result.token,
    });

    // 2-8. 로그인 성공 결과를 클라이언트로 응답
    return res.status(200).json({
      success: true,
      message: "로그인 성공",
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    // 2-9. 서버/DB 에러 확인
    console.log("로그인 에러:", err);
    console.log("로그인 에러 message:", err.message);
    console.log("로그인 에러 code:", err.code);

    // 2-10. DB/서버 에러는 app.js의 전역 에러 처리 미들웨어로 전달
    const error = new Error("로그인 실패");
    error.status = 500;
    return next(error);
  }
};

// 3. 로그아웃 API 요청 처리
const logout = async (req, res, next) => {
  try {
    // 3-1. service의 로그아웃 처리 결과를 기다린 후 저장
    const result = await authService.logout();

    // 3-2. 서버 확인용 로그
    console.log("로그아웃 API 결과:", result);
    console.log("로그아웃 응답 상태:", result.status);

    // 3-3. HTTP 상태 코드와 JSON 형태로 클라이언트에 응답
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    // 3-4. 서버/DB 에러 확인
    console.log("로그아웃 에러:", err);
    console.log("로그아웃 에러 message:", err.message);
    console.log("로그아웃 에러 code:", err.code);

    // 3-5. DB/서버 에러는 app.js의 전역 에러 처리 미들웨어로 전달
    const error = new Error("로그아웃 실패");
    error.status = 500;
    return next(error);
  }
};

// 4. 닉네임 변경 API 요청 처리
const updateNickname = async (req, res, next) => {
  try {
    // 4-1. JWT 인증 미들웨어가 넣어준 로그인 사용자 user_idx 꺼내기
    const user_idx = req.user?.user_idx;

    // 4-2. 요청 body에서 변경할 닉네임 꺼내기
    const { nickname } = req.body;

    // 4-3. 요청 값 확인 로그
    console.log("닉네임 변경 요청 값:", {
      user_idx,
      nickname,
    });

    // 4-4. service의 닉네임 변경 처리 결과를 기다린 후 저장
    const result = await authService.updateNickname(user_idx, nickname);

    // 4-5. 서버 확인용 로그
    console.log("닉네임 변경 API 결과:", result);
    console.log("닉네임 변경 응답 상태:", result.status);

    // 4-6. HTTP 상태 코드와 JSON 형태로 클라이언트에 응답
    return res.status(result.status).json(result);
  } catch (err) {
    // 4-7. 서버/DB 에러 확인
    console.log("닉네임 변경 에러:", err);
    console.log("닉네임 변경 에러 message:", err.message);
    console.log("닉네임 변경 에러 code:", err.code);

    // 4-8. DB/서버 에러는 app.js의 전역 에러 처리 미들웨어로 전달
    const error = new Error("닉네임 변경 실패");
    error.status = 500;
    return next(error);
  }
};

// 5. 비밀번호 변경 API 요청 처리
const updatePassword = async (req, res, next) => {
  try {
    // 5-1. JWT 인증 미들웨어가 넣어준 로그인 사용자 user_idx 꺼내기
    const user_idx = req.user?.user_idx;

    // 5-2. 요청 body에서 현재 비밀번호와 새 비밀번호 꺼내기
    const { currentPassword, newPassword } = req.body;

    // 5-3. 요청 값 확인 로그
    console.log("비밀번호 변경 요청 값 확인:", {
      user_idx,
      currentPasswordLength: currentPassword?.length,
      newPasswordLength: newPassword?.length,
    });

    // 5-4. service의 비밀번호 변경 처리 결과를 기다린 후 저장
    const result = await authService.updatePassword(
      user_idx,
      currentPassword,
      newPassword,
    );

    // 5-5. 서버 확인용 로그
    console.log("비밀번호 변경 API 결과:", result);
    console.log("비밀번호 변경 응답 상태:", result.status);

    // 5-6. HTTP 상태 코드와 JSON 형태로 클라이언트에 응답
    return res.status(result.status).json(result);
  } catch (err) {
    // 5-7. 서버/DB 에러 확인
    console.log("비밀번호 변경 에러:", err);
    console.log("비밀번호 변경 에러 message:", err.message);
    console.log("비밀번호 변경 에러 code:", err.code);

    // 5-8. DB/서버 에러는 app.js의 전역 에러 처리 미들웨어로 전달
    const error = new Error("비밀번호 변경 실패");
    error.status = 500;
    return next(error);
  }
};

// 6. 회원 탈퇴 API 요청 처리
const deleteAccount = async (req, res, next) => {
  try {
    // 6-1. JWT 인증 미들웨어가 넣어준 로그인 사용자 user_idx 꺼내기
    const user_idx = req.user?.user_idx;

    // 6-2. 요청 값 확인 로그
    console.log("회원 탈퇴 요청 값 확인:", {
      user_idx,
    });

    // 6-3. service의 회원 탈퇴 처리 결과를 기다린 후 저장
    const result = await authService.deleteAccount(user_idx);

    // 6-4. 서버 확인용 로그
    console.log("회원 탈퇴 API 결과:", result);
    console.log("회원 탈퇴 응답 상태:", result.status);

    // 6-5. HTTP 상태 코드와 JSON 형태로 클라이언트에 응답
    return res.status(result.status).json(result);
  } catch (err) {
    // 6-6. 서버/DB 에러 확인
    console.log("회원 탈퇴 에러:", err);
    console.log("회원 탈퇴 에러 message:", err.message);
    console.log("회원 탈퇴 에러 code:", err.code);

    // 6-7. DB/서버 에러는 app.js의 전역 에러 처리 미들웨어로 전달
    const error = new Error("회원 탈퇴 실패");
    error.status = 500;
    return next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  updateNickname,
  updatePassword,
  deleteAccount,
};
