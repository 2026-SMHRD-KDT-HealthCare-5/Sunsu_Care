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
      {/* 🌟 1. 🌞 이모지 대신 세련된 태양 아이콘으로 교체 (간격 조절 포함) */}
      <Link to="/" className="header__logo" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
        <i className="fa-solid fa-sun" style={{ color: '#ff8c00' }}></i>
        Sun手Care
      </Link>

      <div className="header__actions">
        
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