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
          <div className="user-profile" onClick={() => handleNav('/login')}>
            <i className="fa-regular fa-circle-user profile-icon"></i>
            <span className="profile-text">로그인이 필요합니다</span>
          </div>
          <i className="fa-solid fa-xmark close-icon" onClick={onClose}></i>
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
            <div className="menu-item" onClick={() => handleNav('/mypage')}>
              <i className="fa-solid fa-clock-rotate-left"></i> <span>분석 히스토리</span>
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
          <span>SUN-SCAN AI v2.0</span>
        </div>
      </div>
      
      {/* 바깥 어두운 영역 누르면 닫히게 설정 */}
      <div className={`menu-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
    </>
  );
};

export default SideMenu;