// express 프레임워크 호출
const express = require('express')

// express.Router 객체 생성
const router = express.Router()

// 요청 처리 controller 호출
const profileController = require('../controllers/profileController')

// 1. 프로필 조회 API
// GET /api/profile
router.get('/', profileController.getProfile)

// 2. 설문조사 결과 저장/수정
// PUT /api/profile
router.put('/', profileController.updateProfile)

// router 객체를 app.js에서 사용할 수 있도록 내보내기
module.exports = router