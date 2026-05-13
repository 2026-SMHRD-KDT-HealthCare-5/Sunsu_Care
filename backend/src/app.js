//express 설정
//rotues 연결

const express=require('express')
const userRoutes= require("./routes/userRoutes")

const app=express()

//JSON 요청 받기
app.use(express.json)

app.use("/user", userRoutes)

//모듈 내보내기
module.exports=app