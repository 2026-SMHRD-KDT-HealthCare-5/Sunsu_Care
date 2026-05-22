// backend/routes/suncareRoutes.js
const express = require('express');
const multer = require('multer');
const { analyzeImage, getTaskStatus } = require('../services/fastapiService.js');
const db = require('../db/index.js');

const router = express.Router();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: Number(process.env.UPLOAD_MAX) || 10485760 } 
});

// 1) 클라이언트 업로드 → FastAPI 위임
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: '이미지 파일만 업로드 가능합니다.' });
    }
    const result = await analyzeImage(req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
    });
    return res.status(202).json(result);
  } catch (err) { 
    next(err); 
  }
});

// 2) 클라이언트 폴링(조회)
// backend/src/routes/suncareRoutes.js (해당 엔드포인트 수정)
router.get('/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        console.log(`[백엔드] FastAPI 상태 조회 요청: ${taskId}`); // 요청 확인
        const status = await getTaskStatus(taskId); // 여기서 호출
        res.json(status);
    } catch (error) {
        // [중요] axios 에러 상세 확인
        if (error.response) {
            console.error("FastAPI 응답 에러:", error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error("FastAPI 연결 에러:", error.message);
            res.status(500).json({ message: "FastAPI 연결 실패" });
        }
    }
});

// 3) FastAPI → 콜백 수신
router.post('/callbacks/suncare', express.json(), async (req, res) => {
  try {
    const { task_id, status, result } = req.body;
    console.log(`[Callback] Task ${task_id} 수신 완료, 상태: ${status}`);
    
    if (status === 'completed' && result) {
      const resultString = JSON.stringify(result);
      const query = 'INSERT INTO tb_analysis_log (task_id, analysis_result) VALUES (?, ?)';
      await db.execute(query, [task_id, resultString]);
      console.log(`[Callback] Task ${task_id} DB 저장 성공`);
    } else if (status === 'failed') {
      console.error(`[Callback] Task ${task_id} 분석 실패`);
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Callback Error]:', err);
    return res.status(500).json({ success: false, message: '서버 내부 오류' });
  }
});

// 4) 최종 결과 조회
router.get('/results/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const query = 'SELECT analysis_result FROM tb_analysis_log WHERE task_id = ?';
    const [rows] = await db.execute(query, [taskId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: '아직 분석 결과가 준비되지 않았습니다.' });
    }

    const result = JSON.parse(rows[0].analysis_result);
    return res.json({ status: 'completed', result: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;