//각 API 주소 정의

const express=require("express")
const router = express.Router()

const userController =require("../controllers/userController")

router.get("/", userController.getUsers)

module.exports=router