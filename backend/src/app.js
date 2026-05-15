//1. app.js: 프레임워크 설정 + routes 연결


//express 프레임워크 호출
const express=require('express')

//express 함수 실행 후 app 객체 생성 (서버 설정 객체)
const app=express()

//JSON 형태 요청 데이터 받아서 JS 객체 형태로 변환하는 미들웨어
app.use(express.json())

//각 요청 URL을 해당하는 라우터 호출
const userRoutes= require("./routes/userRoutes")

//특정 URL 해당 라우터로 연결하기
app.use("/user", userRoutes)

//app 객체를 server에서 사용할 수 있도록 내보내기
module.exports=app
