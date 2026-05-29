//서버 실행 부분

//app 불러오기
const app = require('./src/app');

//포트설정
const PORT = 3000;

//서버시작
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}에서 서버 실행 중...`);
});