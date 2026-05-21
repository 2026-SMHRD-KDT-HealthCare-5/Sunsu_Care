const path = require('path');
// 최상단에서 환경변수 로드
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./src/app'); 
const PORT = process.env.PORT || 4000; // 포트 번호 확인 (Node는 보통 4000대 사용)

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`  Server is running on port ${PORT}`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`========================================`);
});