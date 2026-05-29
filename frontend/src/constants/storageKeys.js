// ==========================================================================
//  localStorage 키 + 전역 이벤트 이름 중앙 관리
//  - 키 변경 시 한 곳만 수정하면 모든 사용처가 자동 반영
// ==========================================================================

export const STORAGE_KEYS = Object.freeze({
    AUTH_TOKEN: 'authToken',
    USER_EMAIL: 'userEmail',
    USER_NICKNAME: 'userNickname',
    USER_PROFILE: 'userProfile',
});

export const AUTH_EVENTS = Object.freeze({
    /** useAuth ↔ axiosInstance ↔ SideMenu ↔ AccountSettings 동기화 이벤트 */
    CHANGE: 'sun-care-auth-change',
});

// 401/로그아웃 시 한 번에 지워야 할 사용자 세션 키 목록
export const USER_SESSION_KEYS = Object.freeze([
    STORAGE_KEYS.AUTH_TOKEN,
    STORAGE_KEYS.USER_EMAIL,
    STORAGE_KEYS.USER_NICKNAME,
]);
