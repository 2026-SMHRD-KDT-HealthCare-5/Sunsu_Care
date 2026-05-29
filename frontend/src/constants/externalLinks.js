// ==========================================================================
//  외부 링크 + 외부 서비스 URL 패턴 중앙 관리
//  - 추가/삭제 시 페이지 코드 손대지 않고 이 파일만 수정
// ==========================================================================

/* ===== GuidePage 관련 사이트 ===== */
export const GUIDE_RELATED_SITES = Object.freeze([
    {
        icon: '🏥',
        title: '질병관리청 국가건강정보포털',
        desc: '자외선 건강정보 상세 안내',
        domain: 'health.kdca.go.kr',
        href: 'https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5500',
    },
    {
        icon: '🧴',
        title: 'American Academy of Dermatology',
        desc: '선크림 사용법 · 자가진단 · 피부암 예방',
        domain: 'aad.org',
        href: 'https://www.aad.org/public/diseases/skin-cancer/prevent/how',
    },
]);

/* ===== GuidePage 추천 영상 ===== */
export const GUIDE_VIDEOS = Object.freeze([
    {
        id: 'WEQz_U7uB58',
        title: "선크림 '이렇게' 발랐더니 오히려 피부노화 빨라지는 이유?! ㅣ 자외선차단제의 역설",
        channel: 'YouTube',
        href: 'https://youtu.be/WEQz_U7uB58',
    },
    {
        id: 'Sa8i9Q0fPJk',
        title: '선크림 바르는 법, 선크림의 중요성! [현명한 식약처 탐험생활]',
        channel: '식품의약품안전처',
        href: 'https://youtu.be/Sa8i9Q0fPJk',
    },
    {
        id: '9oAWz7XYQ_k',
        title: '선크림 후 세안, 이건 추천하지 않습니다',
        channel: '더마킹 김동하 피부 연구소',
        href: 'https://www.youtube.com/watch?v=9oAWz7XYQ_k',
    },
]);

/* ===== YouTube 썸네일 URL 빌더 ===== */
/** YouTube 영상 ID → 고화질 썸네일 이미지 URL */
export const getYouTubeThumbnailUrl = (videoId) =>
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
