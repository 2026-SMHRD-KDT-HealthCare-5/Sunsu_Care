import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

import SideMenu from './SideMenu'; 

function Header() {
  const navigate = useNavigate();
 
  const { isLoggedIn, logout } = useAuth();
  
  // 메뉴 열림/닫힘 상태 관리 스위치
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      {}
      <Link to="/" className="header__logo">🌞 SunCare</Link>

      <div className="header__actions">
        {}
        <button
          type="button"
          className="header__icon-btn"
          onClick={() => navigate(isLoggedIn ? '/mypage' : '/login')}
          aria-label={isLoggedIn ? '마이페이지' : '로그인'}
        >
          👤
        </button>

        {/* 작대기 3개 버튼 (누르면 사이드 메뉴 열림) */}
        <button
          type="button"
          className="header__icon-btn"
          onClick={() => setIsMenuOpen(true)}
          aria-label="메뉴"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        {/* 슬라이드 메뉴 달아주기 */}
        <SideMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
        />
      </div>
    </header>
  );
}

export default Header;