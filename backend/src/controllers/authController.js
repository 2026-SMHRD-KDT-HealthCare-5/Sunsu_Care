// controller: 요청 받기 -> service 호출 -> 응답 내보내기

const authService = require("../services/authService");

// 1. 회원가입 API 요청 처리
const signup = async (req, res) => {
  try {
    console.log("회원가입 요청 body:", req.body);

    const { email, password, nickname } = req.body;

    // 1-1. 입력값 검증
    if (!email || !password || !nickname) {
      console.log("회원가입 입력값 누락:", {
        email: !!email,
        password: !!password,
        nickname: !!nickname,
      });

      // 400: 요청값 오류
      // .json(): 응답 데이터 json 형태로 출력
      return res.status(400).json({
        success: false,
        message: "이메일, 비밀번호, 닉네임을 모두 입력하세요",
      });
    }

    console.log("authService.signup 호출 직전:", {
      email,
      nickname,
      passwordLength: password.length,
    });

    // authService의 signup 함수에 매개변수 값 넘겨서 DB에 저장/처리
    // 수정한 이유:
    // service에서 success, status, message, user 형태의 최종 응답 객체를 만들어 넘기기 때문에
    // controller에서는 result를 그대로 응답으로 내보내면 됨
    // 추가 수정 이유:
    // authService가 callback 방식이 아니라 async/await 방식으로 변경되었기 때문에
    // Promise로 감싸지 않고 await authService.signup(...)으로 직접 결과를 받음
    const result = await authService.signup(email, password, nickname);

    console.log("authService.signup 결과:", result);

    // 수정한 이유:
    // 회원가입 성공은 201, 이메일 중복은 409처럼
    // service에서 넘겨준 status 값에 따라 응답 상태코드를 결정함
    console.log("회원가입 응답 status:", result.status);

    return res.status(result.status).json(result);
  } catch (err) {
    console.log("회원가입 에러:", err);
    console.log("회원가입 에러 message:", err.message);
    console.log("회원가입 에러 code:", err.code);

    // DB/서버 에러 검출 (500: 서버 내부 오류)
    return res.status(500).json({
      success: false,
      message: "회원가입 실패",
      error: err.message,
    });
  }
};

// 2. 로그인 API 요청 처리
const login = async (req, res) => {
  try {
    console.log("로그인 요청 body:", req.body);

    const { email, password } = req.body;

    // 2-1. 입력값 검증
    if (!email || !password) {
      console.log("로그인 입력값 누락:", {
        email: !!email,
        password: !!password,
      });

      return res.status(400).json({
        success: false,
        message: "이메일과 비밀번호를 모두 입력하세요",
      });
    }

    console.log("authService.login 호출 직전:", {
      email,
      passwordLength: password.length,
    });

    // authService의 login 함수에 매개변수 값 넘겨서 DB에 저장/처리
    // 수정한 이유:
    // 기존에는 callback 안에서 result를 받았지만,
    // authService가 async/await 방식으로 변경되었기 때문에
    // await authService.login(...)으로 직접 결과를 받음
    const result = await authService.login(email, password);

    console.log("authService.login 결과:", result);

    // 이메일 또는 비밀번호가 틀린 경우
    if (!result.success) {
      console.log("로그인 실패 result:", result);

      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }

    console.log("로그인 성공 user:", result.user);
    console.log("로그인 성공 token 존재 여부:", !!result.token);
    console.log("로그인 성공 token 앞부분:", result.token?.slice(0, 20));

    // 로그인 성공 응답
    return res.status(200).json({
      success: true,
      message: "로그인 성공",
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    console.log("로그인 에러:", err);
    console.log("로그인 에러 message:", err.message);
    console.log("로그인 에러 code:", err.code);

    return res.status(500).json({
      success: false,
      message: "로그인 실패",
      error: err.message,
    });
  }
};

// 3. 로그아웃 API 요청 처리
const logout = async (req, res) => {
  try {
    // 수정한 이유:
    // 기존에는 callback 안에서 result를 받았지만,
    // authService가 async/await 방식으로 변경되었기 때문에
    // await authService.logout()으로 직접 결과를 받음
    const result = await authService.logout();

    console.log("authService.logout 결과:", result);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    console.log("로그아웃 에러:", err);
    console.log("로그아웃 에러 message:", err.message);

    return res.status(500).json({
      success: false,
      message: "로그아웃 실패",
      error: err.message,
    });
  }
};

// 4. 닉네임 변경
const updateNickname = async (req, res) => {
  try {
    const user_idx = req.user?.user_idx;
    const { nickname } = req.body;
    const result = await authService.updateNickname(user_idx, nickname);
    return res.status(result.status).json(result);
  } catch (err) {
    console.log('닉네임 변경 컨트롤러 에러:', err);
    return res.status(500).json({ success: false, message: '닉네임 변경 실패', error: err.message });
  }
};

// 5. 비밀번호 변경
const updatePassword = async (req, res) => {
  try {
    const user_idx = req.user?.user_idx;
    const { currentPassword, newPassword } = req.body;
    const result = await authService.updatePassword(user_idx, currentPassword, newPassword);
    return res.status(result.status).json(result);
  } catch (err) {
    console.log('비밀번호 변경 컨트롤러 에러:', err);
    return res.status(500).json({ success: false, message: '비밀번호 변경 실패', error: err.message });
  }
};

// 6. 회원 탈퇴
const deleteAccount = async (req, res) => {
  try {
    const user_idx = req.user?.user_idx;
    const result = await authService.deleteAccount(user_idx);
    return res.status(result.status).json(result);
  } catch (err) {
    console.log('회원 탈퇴 컨트롤러 에러:', err);
    return res.status(500).json({ success: false, message: '회원 탈퇴 실패', error: err.message });
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
