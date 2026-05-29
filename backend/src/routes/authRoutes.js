// 2. routes: 요청에 대한 각 URL을 어떤 controller 함수로 연결할지 정의

// express 프레임워크 호출
const express = require("express")

// express.Router 객체 생성
// URL을 기능별로 나누기 위한 라우터
const router = express.Router()

// 관련 요청을 처리하는 controller 호출 (미카 님과 팀원분 파일 모두 호출)
const authlogin_Controller = require("../controllers/authlogin_Controller")
const authController = require("../controllers/authController")

// 1. 로그인 라우터 (미카 님이 작업하신 부분)
// 최종 경로: POST /api/auth/login
router.post("/login", authlogin_Controller.login)

// 2. 회원가입 API (팀원분이 작업하신 부분)
// 최종 경로: POST /api/auth/signup
router.post("/signup", authController.signup)

// router 객체를 app.js에서 사용할 수 있도록 내보내기
module.exports = router