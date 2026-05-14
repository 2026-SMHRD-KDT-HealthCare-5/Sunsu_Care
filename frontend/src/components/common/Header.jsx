import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';
// 우리가 만든 멋진 사이드 메뉴 불러오기
import SideMenu from './SideMenu'; 

function Header() {
  const navigate = useNavigate();
  // 팀원분이 만든 로그인 상태 확인 훅 가져오기
  const { isLoggedIn, logout } = useAuth();
  
  // 메뉴 열림/닫힘 상태 관리 스위치
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      {/* 1. 팀원 로고 유지 */}
      <Link to="/" className="header__logo">🌞 SunCare</Link>

      <div className="header__actions">
        {/* 2. 팀원 프로필 아이콘 유지 (로그인 상태에 따라 이동) */}
        <button
          type="button"
          className="header__icon-btn"
          onClick={() => navigate(isLoggedIn ? '/mypage' : '/login')}
          aria-label={isLoggedIn ? '마이페이지' : '로그인'}
        >
          👤
        </button>

        {/* 3. 작대기 3개 햄버거 버튼 (누르면 사이드 메뉴 열림) */}
        <button
          type="button"
          className="header__icon-btn"
          onClick={() => setIsMenuOpen(true)}
          aria-label="메뉴"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        {/* 4. 우리가 분리해서 만든 예쁜 슬라이드 메뉴 달아주기 */}
        <SideMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
        />
      </div>
    </header>
  );
}

export default Header;