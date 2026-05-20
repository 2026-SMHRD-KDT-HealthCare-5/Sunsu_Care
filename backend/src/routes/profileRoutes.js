// express 프레임워크 호출
const express = require('express')

// express.Router 객체 생성
const router = express.Router()

// 요청 처리 controller 호출
const profileController = require('../controllers/profileController')

// 인증 미들웨어 호출
// profileController에서 req.user?.user_idx를 사용하고 있음
// req.user는 JWT 인증 미들웨어가 토큰을 검증한 뒤 넣어주는 값이므로
// 라우터에서 authMiddleware를 먼저 실행해야 함
const authMiddleware = require("../middlewares/authMiddleware");

// 1. 프로필 조회 API
// GET /api/profile
router.get('/', authMiddleware, profileController.getProfile)

// 2. 설문조사 결과 저장/수정
// PUT /api/profile
router.put('/', authMiddleware, profileController.updateProfile)

// router 객체를 app.js에서 사용할 수 있도록 내보내기
module.exports = router