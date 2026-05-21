// root/backend/src/controllers/suncareController

const fastapiService = require('../services/fastapiService');
const response = require('../utils/response');
const profileService = require('../services/profileService');

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

        // 3. 유저 프로필 데이터 조회
        const user_idx = req.user.user_idx;
        const userProfile = await profileService.getProfileByUserId(user_idx) || {}; // 없으면 빈 객체

        // 4. FastAPI 서비스 호출
        const result = await fastapiService.analyzeImage(req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            user_profile: {
                skin_type: userProfile.skin_type || '정보없음',
                sensitivity: userProfile.senstive_yn || 'N',
                avoid_ingredient: JSON.parse(userProfile.avoid_ingredient || '[]')
            }
        });

        // 5. 결과 반환
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