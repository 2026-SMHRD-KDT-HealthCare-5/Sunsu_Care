//controller: 요청 받기 ->server 호출 -> 응답 내보내기

//해당 요청에 해당하는 실제 로직 가져오기
const userService = require("../services/userService");

//요청 처리 함수
const getusers = (req, res) => {
  const {name, age}=req.body
  userService.getUsers((err, rows) => {
    if (!err) {
      res.json(rows);
    } else {
      console.log(err);
      res.status(500).send("조회실패");
    }
  });
};

//getUsers함수를 다른 파일에서 사용할 수 있게 내보내기
module.exports = {
  getusers,
};
