//controller: 요청 받기 ->server 호출 -> 응답 내보내기

//해당 요청에 해당하는 실제 로직 가져오기
const authService = require("../services/authService");

//요청 처리 함수
const login = (req, res) => 
  {
  //post로 받아온 email, pw 받기
  const {email, password} = req.body
  
  //입렵값 검증

  if(!email || !password){
    return res.status(400).json({
      success: false,
      message: "이메일과 비밀번호를 입력해주세요"
    })
  }
  
  //authService의 login 함수 호출
  authService.login(email, password,(err, result) => 
    {
      if (!err) 
      {
        res.json(result);
      }
      else 
      {
        console.log(err);
        res.status(500).send("조회실패");
      }
  });
};

//getUsers함수를 다른 파일에서 사용할 수 있게 내보내기
module.exports ={login};
