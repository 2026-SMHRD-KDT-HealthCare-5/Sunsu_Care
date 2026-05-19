// src/routes/suncareRoutes.js
import express from 'express';
import multer from 'multer';
import { startSuncareAnalyze, getTask } from '../services/fastapiService.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: Number(process.env.UPLOAD_MAX) } });

// 1) 클라이언트 업로드 → FastAPI 위임
router.post('/suncare/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: '이미지 파일만 업로드 가능합니다.' });
    }
    const result = await startSuncareAnalyze(req.file);
    return res.status(202).json(result); // {taskId, requestId, status}
  } catch (err) { next(err); }
});

// 2) 클라이언트 폴링(선택)
router.get('/suncare/tasks/:taskId', async (req, res, next) => {
  try {
    const data = await getTask(req.params.taskId);
    return res.json(data);
  } catch (err) { next(err); }
});

// 3) FastAPI → 콜백 수신
router.post('/callbacks/suncare', express.json(), async (req, res) => {
  // 필요시 HMAC 서명 검증 추가
  const { task_id, request_id, status, result, error } = req.body;

  // 결과를 Redis/DB에 저장하거나 바로 웹훅으로 프런트에 푸시(SSE/WebSocket) 해도 됨.
  // 예시로 로그만:
  req.app.get('logger')?.info('Suncare callback', { task_id, request_id, status });

  return res.sendStatus(204);
});

export default router;
