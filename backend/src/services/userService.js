//실제 로직 처리부분 CRUD 로직 부분

//DB 연결 객체 가져오기
const conn = require("../db/index");

//회원 조회 함수
const getUsers = (name, age, callback) => {

    //1. sql문 작성
    let sql = "SELECT name FROM test WHERE name = ? and age=?";

    //2. sql문 실행
    conn.query(sql, [name, age], (err, rows) => {

        callback(err, rows);

    });

};

//외부에서 사용할 수 있게 내보내기
module.exports = {
    getUsers,
};