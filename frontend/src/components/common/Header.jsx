import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

import SideMenu from './SideMenu';

function Header() {
  // 사이드 메뉴 열림/닫힘 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      {/* 🌟 세련된 FA 태양 아이콘 + 브랜드명 */}
      <Link to="/" className="header__logo">
        <i className="fa-solid fa-sun header__logo-icon"></i>
        <span>Sun手Care</span>
      </Link>

      <div className="header__actions">
        {/* 작대기 3개 버튼 → 사이드 메뉴 열림 (마이페이지/로그인은 SideMenu 내부) */}
        <button
          type="button"
          className="header__icon-btn"
          onClick={() => setIsMenuOpen(true)}
          aria-label="메뉴"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <SideMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
      </div>
    </header>
  );
}

export default Header;
