const fastapiService = require('../services/fastapiService');
const response = require('../utils/response'); // 공통 응답 포맷이 있다면 활용

/**
 * 선케어 성분 분석 요청 컨트롤러
 */
const analyzeSuncare = async (req, res) => {
    try {
        // 1. 파일 업로드 체크 (multer 미들웨어를 거쳐 req.file에 담김)
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "이미지 파일이 누락되었습니다."
            });
        }

        // 2. 추가 정보 추출 (필요 시)
        const { callback_url, request_id } = req.body;

        // 3. FastAPI 서비스 호출
        // fastapiService.analyzeImage는 FastAPI의 /api/v1/suncare/analyze로 요청을 보냄
        const result = await fastapiService.analyzeImage(req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            callback_url: callback_url || null,
            request_id: request_id || `req_${Date.now()}`
        });

        // 4. 결과 반환 (FastAPI에서 준 task_id 포함)
        return res.status(202).json({
            success: true,
            message: "분석 작업이 접수되었습니다.",
            data: {
                task_id: result.task_id,
                status: result.status
            }
        });

    } catch (error) {
        console.error("Suncare Controller Error:", error);
        
        // FastAPI 서버 연결 실패 등 에러 처리
        return res.status(500).json({
            success: false,
            message: "AI 서버 통신 중 오류가 발생했습니다.",
            error: error.message
        });
    }
};

/**
 * 특정 작업의 분석 결과 조회 (Polling용)
 */
const getAnalysisStatus = async (req, res) => {
    try {
        const { task_id } = req.params;

        if (!task_id) {
            return res.status(400).json({ success: false, message: "task_id가 필요합니다." });
        }

        const taskStatus = await fastapiService.getTaskStatus(task_id);

        return res.status(200).json({
            success: true,
            data: taskStatus
        });

    } catch (error) {
        console.error("Status Check Error:", error);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: "상태 조회 중 오류가 발생했습니다.",
            error: error.message
        });
    }
};

module.exports = {
    analyzeSuncare,
    getAnalysisStatus
};