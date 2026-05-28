import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // 실제 경로에 맞게 수정
import './AccountSettings.css';

const AccountSettings = () => {
    const navigate = useNavigate();
    const { userEmail, userNickname } = useAuth(); // 현재 유저 정보 가져오기

    // 상태 관리 (닉네임, 비밀번호)
    const [nickname, setNickname] = useState(userNickname || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateNickname = (e) => {
        e.preventDefault();
        console.log("닉네임 변경 요청:", nickname);
        // TODO: API 연동
    };

    const handleUpdatePassword = (e) => {
        e.preventDefault();
        console.log("비밀번호 변경 요청");
        // TODO: API 연동
    };

    const handleDeleteAccount = () => {
        const isConfirm = window.confirm("정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.");
        if (isConfirm) {
            console.log("회원 탈퇴 요청");
            // TODO: API 연동 및 로그아웃/홈 이동 처리
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
                        <button type="submit" className="save-btn-small">변경</button>
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
                    <button type="submit" className="save-btn-full">
                        비밀번호 저장
                    </button>
                </form>
            </div>

            {/* ── 3. 위험 구역 (회원 탈퇴) ── */}
            <div className="mypage-card danger-zone-card">
                <div className="danger-text-info">
                    <h3 className="danger-title"><i className="fa-solid fa-triangle-exclamation"></i> 위험 구역</h3>
                    <p>회원 탈퇴 시 모든 분석 히스토리와 정보가 영구 삭제됩니다.</p>
                </div>
                <button className="withdraw-btn" onClick={handleDeleteAccount}>
                    회원 탈퇴하기
                </button>
            </div>
        </div>
    );
};

export default AccountSettings;