import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { updateNickname, updatePassword, deleteAccount } from '../api/authApi';
import { clearAllStorage } from '../utils/storage';
import './AccountSettings.css';

const AccountSettings = () => {
    const navigate = useNavigate();
    const { userEmail, userNickname, refreshNickname, logout } = useAuth();

    // 상태 관리 (닉네임, 비밀번호)
    const [nickname, setNickname] = useState(userNickname || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleUpdateNickname = async (e) => {
        e.preventDefault();
        if (!nickname || nickname.trim().length < 2) {
            alert('닉네임은 2자 이상 입력해주세요.');
            return;
        }
        if (nickname.trim() === userNickname) {
            alert('이전 닉네임과 동일합니다.');
            return;
        }
        try {
            setSubmitting(true);
            const result = await updateNickname(nickname.trim());
            if (result.success) {
                refreshNickname(result.nickname);
                alert('✅ 닉네임이 변경되었습니다.');
            } else {
                alert(result.message || '닉네임 변경 실패');
            }
        } catch (err) {
            console.error('닉네임 변경 에러:', err);
            alert(err.response?.data?.message || '닉네임 변경 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('모든 비밀번호 필드를 입력해주세요.');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('새 비밀번호와 확인이 일치하지 않습니다.');
            return;
        }
        if (newPassword.length < 6) {
            alert('새 비밀번호는 6자 이상이어야 합니다.');
            return;
        }
        try {
            setSubmitting(true);
            const result = await updatePassword({ currentPassword, newPassword });
            if (result.success) {
                alert('✅ 비밀번호가 변경되었습니다.');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                alert(result.message || '비밀번호 변경 실패');
            }
        } catch (err) {
            console.error('비밀번호 변경 에러:', err);
            alert(err.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        const first = window.confirm('정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.');
        if (!first) return;
        const second = window.confirm('마지막 확인입니다. 탈퇴를 진행하시겠어요?');
        if (!second) return;

        try {
            setSubmitting(true);
            const result = await deleteAccount();
            if (result.success) {
                alert('회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.');
                clearAllStorage();
                window.dispatchEvent(new Event('sun-care-auth-change'));
                navigate('/');
            } else {
                alert(result.message || '회원 탈퇴 실패');
            }
        } catch (err) {
            console.error('회원 탈퇴 에러:', err);
            alert(err.response?.data?.message || '회원 탈퇴 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mypage-container">
            {/* 🌟 상단 뒤로가기 헤더 */}
            <div className="settings-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <h1 className="settings-title">회원 정보 관리</h1>
                <div style={{ width: '38px' }}></div> {/* 타이틀 중앙 정렬용 여백 */}
            </div>

            {/* ── 1. 기본 정보 & 닉네임 변경 ── */}
            <div className="mypage-card">
                <h3 className="settings-card-title">
                    <i className="fa-solid fa-user-pen"></i> 프로필 설정
                </h3>
                
                <div className="settings-form-group">
                    <label className="settings-label">이메일 (아이디)</label>
                    <input 
                        type="email" 
                        className="settings-input readonly" 
                        value={userEmail || 'user@example.com'} 
                        readOnly 
                    />
                </div>

                <form onSubmit={handleUpdateNickname} className="settings-form-group">
                    <label className="settings-label">닉네임</label>
                    <div className="input-with-button">
                        <input 
                            type="text" 
                            className="settings-input" 
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="새로운 닉네임 입력" 
                        />
                        <button type="submit" className="save-btn-small" disabled={submitting}>
                            {submitting ? '...' : '변경'}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── 2. 비밀번호 변경 ── */}
            <div className="mypage-card">
                <h3 className="settings-card-title">
                    <i className="fa-solid fa-lock"></i> 비밀번호 변경
                </h3>
                
                <form onSubmit={handleUpdatePassword}>
                    <div className="settings-form-group">
                        <input 
                            type="password" 
                            className="settings-input" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="현재 비밀번호" 
                        />
                    </div>
                    <div className="settings-form-group">
                        <input 
                            type="password" 
                            className="settings-input" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="새 비밀번호" 
                        />
                    </div>
                    <div className="settings-form-group">
                        <input 
                            type="password" 
                            className="settings-input" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="새 비밀번호 확인" 
                        />
                    </div>
                    <button type="submit" className="save-btn-full" disabled={submitting}>
                        {submitting ? '저장 중...' : '비밀번호 저장'}
                    </button>
                </form>
            </div>

            {/* ── 3. 위험 구역 (회원 탈퇴) ── */}
            <div className="mypage-card danger-zone-card">
                <div className="danger-text-info">
                    <h3 className="danger-title"><i className="fa-solid fa-triangle-exclamation"></i> 위험 구역</h3>
                    <p>회원 탈퇴 시 모든 분석 히스토리와 정보가 영구 삭제됩니다.</p>
                </div>
                <button className="withdraw-btn" onClick={handleDeleteAccount} disabled={submitting}>
                    {submitting ? '처리 중...' : '회원 탈퇴하기'}
                </button>
            </div>
        </div>
    );
};

export default AccountSettings;