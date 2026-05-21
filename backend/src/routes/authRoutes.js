
//routes: 요청에 대한 각 URL을 어떤 controller 함수로 연결할지 정의

// express 프레임워크 호출
const express = require("express")

// express.Router 객체 생성
// URL을 기능별로 나누기 위한 라우터
const router = express.Router()

// 관련 요청을 처리하는 controller 호출
const authController = require("../controllers/authController")

// 1. 회원가입 API
// 최종 경로: POST/api/signup
router.post("/signup",authController.signup)

// 2. 로그인 API
// 최종 경로: POST/api/login
router.post("/login", authController.login)

// 3. 로그아웃 API
// 최종 경로: POST/api/logout
router.post("/logout",authController.logout)

// router 객체를 app.js에서 사용할 수 있도록 내보내기
module.exports = router


