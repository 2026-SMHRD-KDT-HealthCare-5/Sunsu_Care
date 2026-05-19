const multer = require('multer');
const path = require('path');

/**
 * 1. Multer 저장소 설정
 * 파일을 디스크에 쓰지 않고 메모리(Buffer)에 임시 보관합니다. 
 * AI 서버로 바로 쏠 것이기 때문에 서버의 저장 공간을 낭비하지 않습니다.
 */
const storage = multer.memoryStorage();

/**
 * 2. 파일 필터 (확장자 검증)
 */
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('이미지 파일(jpg, jpeg, png, webp)만 업로드 가능합니다.'));
    }
};

/**
 * 3. Multer 미들웨어 구성
 * .env에 설정한 UPLOAD_MAX(10MB) 값을 가져와서 적용합니다.
 */
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.UPLOAD_MAX) || 10 * 1024 * 1024 // 기본값 10MB
    },
    fileFilter: fileFilter
});

/**
 * 4. 파일 관련 유틸리티 함수
 * (필요 시 파일명 생성이나 바이너리 변환 로직 추가)
 */
const fileUtils = {
    // 예: 파일 확장자 추출
    getExtension: (filename) => {
        return path.extname(filename).toLowerCase();
    }
};

module.exports = {
    upload,
    fileUtils
};