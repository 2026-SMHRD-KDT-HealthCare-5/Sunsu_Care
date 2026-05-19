//DB 연결

//1. mysql2 모듈 가져오기
const db=require("mysql2")

//2. 사용할 db 정보 정의
const db_info = {
  host: "project-db-campus.smhrd.com",
  port: 3312,
  user: "cd_25K_HI5_p2_3",
  password: "smhrd3",
  database: "cd_25K_HI5_p2_3"
};

//3. db 연결 객체 생성
module.exports=db.createConnection(db_info)