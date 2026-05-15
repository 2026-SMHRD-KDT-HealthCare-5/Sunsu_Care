// //서버 실행 부분

// //app 불러오기
// const app = require("./src/app");

// //포트 설정
// const port = 3000;

// //서버 시작
// app.listen(port, () => {
//     console.log(`${port}번 포트에서 서버 실행 중`);
// });


const app = require('./src/app');

const PORT =3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});