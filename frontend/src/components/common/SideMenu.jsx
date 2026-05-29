import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; 
import './SideMenu.css'; 

const SideMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isLoggedIn, userNickname, userEmail } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleNavWithAuth = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
    }
    onClose();
  };

  const profileText = isLoggedIn ? (userNickname || userEmail || '사용자') : '로그인이 필요합니다';
  const handleProfileClick = () => handleNav(isLoggedIn ? '/mypage' : '/login');
  const userInitial = isLoggedIn && userNickname ? userNickname.charAt(0) : 'S';

  return (
    <>
      <div className={`side-menu ${isOpen ? 'active' : ''}`}>
        <div className="menu-header">
          <div className="user-profile" onClick={handleProfileClick} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: '#ff8c00', color: 'white',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontWeight: '800', fontSize: '1.2rem', flexShrink: 0
            }}>
              {userInitial}
            </div>
            <span className="profile-text" style={{ fontWeight: '700', color: '#1e293b' }}>
              {profileText}
            </span>
          </div>
          <i className="fa-solid fa-xmark close-icon" onClick={onClose} style={{ cursor: 'pointer', fontSize: '1.4rem' }}></i>
        </div>

        <div className="menu-list">
          <div className="menu-group">
            <div className="menu-item" onClick={() => handleNav('/')}>
              <i className="fa-solid fa-house"></i> <span>HOME</span>
            </div>
            <div className="menu-item" onClick={() => handleNavWithAuth('/profile')}>
              <i className="fa-solid fa-wand-magic-sparkles"></i> <span>AI 추천 맞춤케어</span>
            </div>
            <div className="menu-item" onClick={() => handleNavWithAuth('/scan')}>
              <i className="fa-solid fa-magnifying-glass-chart"></i> <span>제품 성분 정밀분석</span>
            </div>
          </div>

          <div className="group-title">MY ACCOUNT</div>
          <div className="menu-group">
            <div className="menu-item" onClick={() => handleNav('/mypage')}>
              <i className="fa-solid fa-user-check"></i> <span>나의 피부 정보</span>
            </div>
            <div className="menu-item" onClick={() => handleNav('/history/1')}>
               <i className="fa-solid fa-clock-rotate-left"></i> <span>분석 히스토리</span>
            </div>
            {isLoggedIn ? (
              <div className="menu-item" onClick={() => handleNav('/logout')}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i> <span>로그아웃</span>
              </div>
            ) : (
              <div className="menu-item" onClick={() => handleNav('/login')}>
                <i className="fa-solid fa-arrow-right-to-bracket"></i> <span>로그인</span>
              </div>
            )}
          </div>

          <div className="group-title">SERVICE</div>
          <div className="menu-group">
            
            <div className="menu-item" onClick={() => handleNav('/guide')}>
              <i className="fa-solid fa-book-open"></i> <span>정보</span>
            </div>
            
            <div className="menu-item" onClick={() => handleNav('/ShoppingPage')}>
              <i className="fa-solid fa-bag-shopping"></i> <span>쇼핑</span>
            </div>  
          </div>
        </div>
      </div>
      <div className={`menu-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
    </>
  );
};

export default SideMenu;