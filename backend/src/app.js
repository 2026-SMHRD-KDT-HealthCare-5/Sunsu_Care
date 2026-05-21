// 1. 모듈 불러오기
const express = require('express');
const cors = require('cors');
const path = require('path');

// 라우터 불러오기
const authRoutes = require('./routes/authRoutes'); //backend 회원관리 라우터 호출
const profileRoutes =require('./routes/profileRoutes') //backend 프로필 라우터 호출
// const suncareRoutes = require('./routes/suncareRoutes'); // 선케어 라우터 호출

// express 앱 객체 생성
const app = express();

// 2. 전역 미들웨어 설정
// 다른 포트의 프론트 요청 허용
app.use(cors());

// JSON 요청 데이터를 JS 객체로 변환
app.use(express.json());

// 폼 데이터 처리를 위한 설정
app.use(express.urlencoded({ extended: true }));

// 3. API 라우터 연결
app.use('/api/auth', authRoutes); //backend 회원관리 라우터 연결
app.use('/api/profile',profileRoutes) //backend 회원관리 라우터 연결
// app.use('/api/suncare', suncareRoutes); 

// 4. 에러 처리 미들웨어
// 라우터나 컨트롤러에서 에러가 발생했을 때 서버가 멈추지 않고 
// 프론트엔드에 깔끔한 JSON 포맷으로 에러를 전달합니다.
app.use((err, req, res, next) => {
    console.error("Express Error:", err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "서버 내부 오류가 발생했습니다."
    });
});

// app 객체 내보내기
module.exports = app;