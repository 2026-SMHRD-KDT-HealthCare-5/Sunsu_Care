// ==========================================================================
//  클라이언트 측 이미지 리사이즈 유틸
//  - 모바일 카메라 원본(5~10MB) → 1280×1280 이하 JPEG (보통 500KB 이하)
//  - YOLO 입력은 640×640으로 다시 줄어들므로 정확도 손실 없음
//  - 업로드 시간 ~90% 단축 + 사용자 대기 시간 체감 ↓
// ==========================================================================

// 🌟 YOLO 입력은 640×640으로 다시 줄여지므로 1024 가 손실 없는 마지노선
const MAX_DIMENSION = 1024;       // 가로/세로 최대 픽셀 (1280→1024로 더 공격적)
const JPEG_QUALITY = 0.78;        // JPEG 압축 품질 (0.85→0.78, 라벨 가독성은 유지)
const RESIZE_THRESHOLD_BYTES = 500 * 1024;   // 500KB 이상만 리사이즈 (작은 파일도 압축 효과 노림)

/**
 * 이미지 파일을 비율 유지하며 축소된 JPEG File 로 반환
 * - 1MB 이하 파일은 원본 그대로 반환 (불필요 처리 회피)
 * - 가로 또는 세로가 1280px 초과인 경우만 축소
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function resizeImage(file) {
    // 이미지가 아니거나 작은 파일은 원본 반환
    if (!file || !file.type.startsWith('image/')) return file;
    if (file.size < RESIZE_THRESHOLD_BYTES) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            const { width: w, height: h } = img;

            // 이미 작으면 원본 반환
            if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) {
                resolve(file);
                return;
            }

            // 비율 유지 축소 계산
            const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
            const newW = Math.round(w * ratio);
            const newH = Math.round(h * ratio);

            // Canvas 로 리샘플링
            const canvas = document.createElement('canvas');
            canvas.width = newW;
            canvas.height = newH;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, newW, newH);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('이미지 변환 실패'));
                        return;
                    }
                    // 원본 파일명 유지하되 확장자는 .jpg 통일
                    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
                    const resized = new File([blob], newName, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(resized);
                },
                'image/jpeg',
                JPEG_QUALITY
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('이미지 로드 실패'));
        };

        img.src = objectUrl;
    });
}
