// frontend/src/utils/imageUrl.js
// 제품 이미지 URL 변환 헬퍼

/**
 * tb_product.image_filename → 표시 가능한 URL 변환
 *
 * 규칙:
 * - 비어있음: null 반환 (호출 측에서 placeholder 처리)
 * - "http://" 또는 "https://" 시작: 풀 URL → 그대로
 * - "/" 시작: 경로 → 백엔드 origin과 결합
 * - 그 외 (파일명만): /uploads/products/{filename} 으로 백엔드에서 서빙
 *
 * @param {string|null} filename - DB의 image_filename 값
 * @returns {string|null}
 */
export function getProductImageUrl(filename) {
    if (!filename) return null;

    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }

    // 백엔드 origin 계산 (VITE_API_BASE_URL이 /api로 끝나면 제거)
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    const backendOrigin = apiBase.replace(/\/api\/?$/, '');

    if (filename.startsWith('/')) {
        return `${backendOrigin}${filename}`;
    }

    return `${backendOrigin}/uploads/products/${filename}`;
}
