import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SideMenu.css'; 

const SideMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  // 메뉴 클릭 시 이동하고 메뉴창 닫기
  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <div className={`side-menu ${isOpen ? 'active' : ''}`}>
        <div className="menu-header">
<<<<<<< Updated upstream
          <div className="user-profile" onClick={() => handleNav('/login')}>
            <i className="fa-regular fa-circle-user profile-icon"></i>
            <span className="profile-text">로그인이 필요합니다</span>
=======
          <div className="user-profile" onClick={handleProfileClick} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* 🌟 기존 사람 아이콘을 지우고 추가한 이니셜 프로필 */}
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: '#ff8c00', color: 'white',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontWeight: '800', fontSize: '1.2rem', flexShrink: 0
            }}>
              {/* 로그인이 되어있고 닉네임이 있으면 첫 글자 추출, 아니면 기본값 'S' (SunCare의 S) */}
              {isLoggedIn && userNickname ? userNickname.charAt(0) : 'S'}
            </div>

            <span className="profile-text" style={{ fontWeight: '700', color: '#1e293b' }}>
              {profileText}
            </span>
            
>>>>>>> Stashed changes
          </div>
          <i className="fa-solid fa-xmark close-icon" onClick={onClose} style={{ cursor: 'pointer', fontSize: '1.4rem' }}></i>
        </div>

        <div className="menu-list">
          <div className="menu-group">
            <div className="menu-item" onClick={() => handleNav('/')}>
              <i className="fa-solid fa-house"></i> <span>HOME</span>
            </div>
            <div className="menu-item" onClick={() => handleNav('/profile')}>
              <i className="fa-solid fa-wand-magic-sparkles"></i> <span>AI 추천 맞춤케어</span>
            </div>
            <div className="menu-item" onClick={() => handleNav('/scan')}>
              <i className="fa-solid fa-magnifying-glass-chart"></i> <span>제품 성분 정밀분석</span>
            </div>
          </div>

          <div className="group-title">MY ACCOUNT</div>
          <div className="menu-group">
            <div className="menu-item" onClick={() => handleNav('/mypage')}>
              <i className="fa-solid fa-user-check"></i> <span>나의 피부 정보</span>
            </div>
<<<<<<< Updated upstream
            <div className="menu-item" onClick={() => handleNav('/mypage')}>
              <i className="fa-solid fa-clock-rotate-left"></i> <span>분석 히스토리</span>
=======
            <div className="menu-item" onClick={() => handleNav('/history/1')}>
               <i className="fa-solid fa-clock-rotate-left"></i> <span>분석 히스토리</span>
>>>>>>> Stashed changes
            </div>
          </div>

          <div className="group-title">SERVICE</div>
          <div className="menu-group">
            <div className="menu-item" onClick={() => window.open('https://m.search.naver.com/search.naver?query=선크림+추천', '_blank')}>
              <i className="fa-solid fa-book-open"></i> <span>선케어 매거진 & 블로그</span>
            </div>
          <div className="menu-item" onClick={() => handleNav('/ShoppingPage')}>
              <i className="fa-solid fa-bag-shopping"></i> <span>쇼핑</span>
            </div>  
          </div>
        </div>

        <div className="menu-footer">
          
        </div>
      </div>
      
      {/* 바깥 어두운 영역 누르면 닫히게 설정 */}
      <div className={`menu-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
    </>
  );
};

export default SideMenu;