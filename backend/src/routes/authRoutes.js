const express = require("express");
const router = express.Router();

// 모든 기능을 통합 관리할 컨트롤러를 가져옵니다.
const authController = require("../controllers/authController");

// 1. 회원가입 API (기존 기능 유지)
router.post("/signup", authController.signup);

// 2. 로그인 API (기존 두 컨트롤러의 로그인 로직 비교 후 하나 선택)
// 만약 authlogin_Controller의 로직이 더 중요하다면 아래를 사용하세요.
router.post("/login", authController.login); 

// 3. 로그아웃 API (기존 기능 유지)
router.post("/logout", authController.logout);

module.exports = router;