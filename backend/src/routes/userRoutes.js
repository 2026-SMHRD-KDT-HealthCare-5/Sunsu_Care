//2. routes: 요청에 대한 각 URL을 어떤 controllers 함수 실행할지 연결 주소 정의 

//express 프레임워크 호출
const express=require("express")

//express.Router 객체 생성
//-> URL을 기능별로 나누기 위한 라우터
const router = express.Router()

//관련 요청을 처리하는 contoller 호출
const userController =require("../controllers/userController")

// 1. routes파일에서는 app에서 연결한 URL 이후 경로부터 작성한다
// 2. GET /user/ 요청이 들어오면 userController.getUsers 실행
// 3. router.get(경로, 실행할 함수)
router.get("/", userController.getusers)

// router 객체를 app.js에서 사용할 수 있도록 내보내기
module.exports=router