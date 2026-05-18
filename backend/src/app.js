//1. app.js: 프레임워크 설정 + routes 연결

// express 프레임워크 불러오기
const express = require('express')

// CORS 설정 모듈 불러오기
const cors = require('cors')

// auth 관련 라우터 불러오기
const authRoutes = require('./routes/authRoutes')

// express 앱 객체 생성
const app = express()

// 다른 포트의 프론트 요청 허용
app.use(cors())

// JSON 요청 데이터를 JS 객체로 변환
app.use(express.json())

// auth API 라우터 연결
app.use('/api/auth', authRoutes)

// app 객체 내보내기
module.exports = app