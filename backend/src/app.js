//1. app.js: 프레임워크 설정 + routes 연결

<<<<<<< HEAD

//express 프레임워크 호출
const express=require('express')

//express 함수 실행 후 app 객체 생성 (서버 설정 객체)
const app=express()

//JSON 형태 요청 데이터 받아서 JS 객체 형태로 변환하는 미들웨어
app.use(express.json())

//각 요청 URL을 해당하는 라우터 호출
const authRoutes= require("./routes/authRoutes")

//1. authApi 라우터 경로 설정
app.use("/api/auth", authRoutes)

//app 객체를 server에서 사용할 수 있도록 내보내기
module.exports=app
=======
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
>>>>>>> main
