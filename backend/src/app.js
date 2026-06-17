//서버/API 생성하기 위한 npm 웹 프레임워크 호출
const express = require('express');

//CORS 허용 설정을 위한 Express 미들웨어 호출
const cors = require('cors');

// 파일 경로 처리를 위한 Node.js 내장 모듈 호출
const path = require('path');

//라우터 호출
const authRoutes = require('./routes/authRoutes'); //backend 회원관리 라우터 호출
const profileRoutes =require('./routes/profileRoutes') //backend 프로필 라우터 호출
const suncareRoutes = require('./routes/suncareRoutes'); // 선케어 라우터 호출

//express() 실행 -> Express 앱 객체 생성(서버 설정과 라우터 연결에 사용)
const app = express();

//전역 미들웨어 설정 (해당하는 브라우저 요청만 허용)
app.use(cors({
    origin: "http://localhost:5173"
}));

//JSON 요청 데이터를 req.body로 읽기 위한 미들웨어
app.use(express.json());

//클라이언트가 form 형식으로 보낸 요총 데이털를 req.body로 읽기 위한 미들웨어
app.use(express.urlencoded({ extended: true }));

// 제품 이미지 정적 서빙 (backend/uploads/products/<filename> → /uploads/products/<filename>)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

//API 라우터 연결
app.use('/api/auth', authRoutes); //backend 회원관리 라우터 연결
app.use('/api/profile',profileRoutes) //backend 프로필 라우터 연결
app.use('/api/suncare', suncareRoutes);

//에러 처리 미들웨어
//servie에서 에러발생 시 controller가 에러를 app.js로 보내서 전역으로 에러 처리 방식
app.use((err, req, res, next) => {
    console.error("에러 발생:", err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "서버 내부 오류가 발생했습니다."
    });
});


// Express앱 객체를 다른 파일에서 사용할 수 있도록 내보내기
module.exports = app;


// 백엔드 서버 주소          API 공통 경로   기능 경로      세부 기능
// http://localhost:4000  /api           /auth        /login