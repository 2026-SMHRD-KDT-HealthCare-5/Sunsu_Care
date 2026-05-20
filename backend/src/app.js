const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 2. 환경변수 체크 (dotenv 로드 이후에 체크!)
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

// 3. 모듈 불러오기
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const suncareRoutes = require('./routes/suncareRoutes');

// 4. 나머지 코드...
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/suncare', suncareRoutes); 

app.use((err, req, res, next) => {
    console.error("Express Error:", err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "서버 내부 오류가 발생했습니다."
    });
});

module.exports = app;