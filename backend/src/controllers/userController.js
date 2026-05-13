//요청 응답 처리


const userService=require("../services/userService")

const getUsers=(req,res)=>{
    const users = userService.getUsers()

    res.json()
}
module.exports={
    getusers
}