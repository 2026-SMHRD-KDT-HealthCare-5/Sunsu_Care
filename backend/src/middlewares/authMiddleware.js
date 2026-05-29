// JWT 토큰 라이브러리 호출
const jwt = require("jsonwebtoken");

// 인증 미들웨어 함수
// 요청 헤더에 담긴 JWT 토큰을 확인하고,
// 토큰이 유효하면 req.user에 사용자 정보를 저장한 뒤 다음 함수로 넘김
const authMiddleware = (req, res, next) => {
  try {
    // 요청 헤더에서 Authorization 값 가져오기
    // 예: Authorization: Bearer 토큰값
    const authHeader = req.headers.authorization;

    // Authorization 헤더가 없는 경우
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "인증 토큰이 없습니다.",
      });
    }

    // "Bearer 토큰값" 형태에서 실제 토큰 부분만 추출
    const token = authHeader.split(" ")[1];

    // 토큰 값이 없는 경우
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "토큰 형식이 올바르지 않습니다.",
      });
    }

    // JWT 토큰 검증
    // 로그인할 때 사용한 JWT_SECRET과 같은 값으로 검증해야 함
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 검증된 사용자 정보를 req.user에 저장
    // 이후 controller에서 req.user.user_idx로 사용할 수 있음
    req.user = decoded;

    // 다음 미들웨어 또는 controller로 이동
    next();
  } catch (err) {
    // 🌟 에러 종류별 분기: 만료는 흔한 케이스 → 한 줄 warn / 그 외만 풀 스택
    if (err.name === "TokenExpiredError") {
      console.warn(`[Auth] 토큰 만료 (expiredAt=${err.expiredAt?.toISOString?.()})`);
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "로그인이 만료되었습니다. 다시 로그인해주세요.",
      });
    }
    if (err.name === "JsonWebTokenError") {
      console.warn(`[Auth] 토큰 위변조/형식 오류: ${err.message}`);
      return res.status(401).json({
        success: false,
        code: "TOKEN_INVALID",
        message: "유효하지 않은 토큰입니다.",
      });
    }

    // 그 외 예상치 못한 에러만 풀 스택 출력
    console.error("JWT 인증 에러:", err);
    return res.status(401).json({
      success: false,
      message: "인증 처리 중 오류가 발생했습니다.",
    });
  }
};

module.exports = authMiddleware;