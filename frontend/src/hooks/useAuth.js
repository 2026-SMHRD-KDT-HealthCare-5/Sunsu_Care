// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { login as loginApi, logout as logoutApi } from '../api/authApi';
import { getAuthToken, getUserEmail, clearAllStorage } from '../utils/storage';
import { STORAGE_KEYS, AUTH_EVENTS } from '../constants/storageKeys';

export function useAuth() {
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState('');
    const [userNickname, setUserNickname] = useState('');

    useEffect(() => {
        const sync = () => {
            setToken(getAuthToken());
            setEmail(getUserEmail() || '');
            setUserNickname(localStorage.getItem(STORAGE_KEYS.USER_NICKNAME) || '');
        };

        sync();

        window.addEventListener(AUTH_EVENTS.CHANGE, sync);
        window.addEventListener('storage', sync);

        return () => {
            window.removeEventListener(AUTH_EVENTS.CHANGE, sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const login = async (loginEmail, password) => {
        const result = await loginApi({ email: loginEmail, password });
        const newToken = result.token ?? result.accessToken;
        const user = result.user ?? {};
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
        localStorage.setItem(STORAGE_KEYS.USER_EMAIL, user.email || loginEmail);
        localStorage.setItem(STORAGE_KEYS.USER_NICKNAME, user.nickname || '');
        window.dispatchEvent(new Event(AUTH_EVENTS.CHANGE));
        return result;
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch (err) {
            console.error('로그아웃 API 실패:', err);
        } finally {
            clearAllStorage();
            window.dispatchEvent(new Event(AUTH_EVENTS.CHANGE));
        }
    };

    // 닉네임 로컬 갱신 (DB 변경 후 즉시 UI 반영용)
    const refreshNickname = (newNickname) => {
        if (newNickname) {
            localStorage.setItem(STORAGE_KEYS.USER_NICKNAME, newNickname);
            window.dispatchEvent(new Event(AUTH_EVENTS.CHANGE));
        }
    };

    return {
        isLoggedIn: !!token,
        userEmail: email,
        userNickname,
        login,
        logout,
        refreshNickname,
    };
}
