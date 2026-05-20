const express = require('express');
const multer = require('multer');
// DB 관련 함수는 모두 제거하고, FastAPI 서비스 함수만 가져옵니다.
const { startSuncareAnalyze, getTaskStatus } = require('../services/fastapiService.js');

const router = express.Router();
const upload = multer({ limits: { fileSize: Number(process.env.UPLOAD_MAX) || 10485760 } });

// 1) 클라이언트 업로드 → FastAPI 위임
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: '이미지 파일만 업로드 가능합니다.' });
    }
    const result = await startSuncareAnalyze(req.file);
    return res.status(202).json(result);
  } catch (err) { next(err); }
});

// 2) 클라이언트 폴링(조회) - DB 없이 API에서 즉시 조회
router.get('/tasks/:taskId', async (req, res, next) => {
  try {
    // API 조회로 일원화
    const data = await getTaskStatus(req.params.taskId);
    return res.json(data);
  } catch (err) { next(err); }
});

// 3) FastAPI → 콜백 수신
router.post('/callbacks/suncare', express.json(), async (req, res) => {
  const { task_id, request_id, status, result, error } = req.body;
  console.log(`[Callback] Task ${task_id} 수신 완료, 상태: ${status}`);
  // 콜백 데이터를 여기서 처리하세요.
  return res.sendStatus(204);
});

module.exports = router;