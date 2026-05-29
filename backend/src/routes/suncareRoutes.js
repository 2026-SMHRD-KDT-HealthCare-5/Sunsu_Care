// backend/src/routes/suncareRoutes.js
// 선케어 관련 라우트 정의 (실제 로직은 suncareController에 위임)

const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/suncareController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.UPLOAD_MAX) || 10485760 }
});

// 1) 이미지 업로드 + DB 저장 + FastAPI 분석 요청
router.post('/upload', authMiddleware, upload.single('file'), ctrl.uploadHandler);

// 2) 분석 작업 상태 폴링
router.get('/tasks/:taskId', ctrl.getTaskStatusHandler);

// 3) FastAPI 콜백 수신 (JSON body, 큰 결과 대비 limit 10mb)
router.post('/callbacks/suncare', express.json({ limit: '10mb' }), ctrl.callbackHandler);

// 4) 분석 결과 단순 조회 (task_id 기반)
router.get('/results/:taskId', ctrl.getResultsHandler);

// 5) 로그인 사용자 분석 히스토리 (최신 5개)
router.get('/analyses', authMiddleware, ctrl.getAnalysesHandler);

// 6) AI 추천 이유 생성 (Gemini)
router.post('/ai-reason', authMiddleware, express.json(), ctrl.aiReasonHandler);

// 7) 사용자 프로필 기반 추천 제품 TOP 3
router.get('/recommendations', authMiddleware, ctrl.getRecommendationsHandler);

// 8) 분석 히스토리 저장 (최대 5개, 초과 시 가장 오래된 것 자동 삭제)
router.post('/analyses/:id/save', authMiddleware, ctrl.saveAnalysisHandler);

// 9) 분석 히스토리 삭제
router.delete('/analyses/:id', authMiddleware, ctrl.deleteAnalysisHandler);

module.exports = router;
