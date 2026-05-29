// ==========================================================================
//  localStorage 유틸 — 키는 src/constants/storageKeys.js 에서 단일 소스
// ==========================================================================
import { STORAGE_KEYS } from '../constants/storageKeys';

// ───── 인증 ─────
export const getAuthToken = () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
export const getUserEmail = () => localStorage.getItem(STORAGE_KEYS.USER_EMAIL);

// ───── 프로필 ─────
export const getProfile = () => {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
};

// ───── 전체 정리 (로그아웃) ─────
export const clearAllStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
};
