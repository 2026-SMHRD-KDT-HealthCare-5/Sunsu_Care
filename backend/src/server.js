require('dotenv').config();

const app = require('./app'); 

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('--------------------------------------------------');
    console.log(`🚀 Express 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    
    if (process.env.FASTAPI_BASE_URL) {
        console.log(`연결된 FastAPI 서버 주소: ${process.env.FASTAPI_BASE_URL}`);
    } else {
        console.warn('경고: .env 파일에 FASTAPI_BASE_URL이 설정되지 않았습니다.');
    }
    console.log('--------------------------------------------------');
});