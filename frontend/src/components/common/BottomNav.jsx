// src/components/common/BottomNav.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HOME_HASH_SCROLL_DELAY_MS } from '../../constants/timings';
import './BottomNav.css';

const HEADER_SCROLL_OFFSET_PX = 60;

const ITEMS = [
  { to: '/', icon: 'fa-solid fa-house', label: '홈' },
  { to: '/#recommend', icon: 'fa-solid fa-wand-magic-sparkles', label: 'AI추천' },
  { to: '/#analysis', icon: 'fa-solid fa-magnifying-glass-chart', label: 'AI분석' },
  { to: '/guide', icon: 'fa-solid fa-book-open', label: '정보' },
];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (to) => {
    // 1. 특정 구역으로 이동하는 해시(스크롤) 링크인 경우
    if (to.startsWith('/#')) {
      const targetId = to.replace('/#', '');

      if (location.pathname === '/') {
        // 🌟 핵심 해결: 이미 홈 화면에 있다면 navigate를 막고 스크롤만 부드럽게 이동시킵니다.
        const element = document.getElementById(targetId);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - HEADER_SCROLL_OFFSET_PX;
          window.scrollTo({ top: y, behavior: 'smooth' });
          // 주소창의 해시만 조용히 업데이트 (튕김 방지)
          window.history.pushState(null, '', to);
        }
      } else {
        // 다른 페이지(정보, 마이페이지 등)에서 홈 화면의 특정 구역으로 갈 경우
        navigate(to);
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - HEADER_SCROLL_OFFSET_PX;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, HOME_HASH_SCROLL_DELAY_MS);
      }
    } else {
      // 2. 해시가 없는 일반 페이지 이동 (예: 홈, 정보 탭)
      if (location.pathname !== to) {
        navigate(to);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => {
        const currentPath = location.pathname + location.hash;
        const isActive = currentPath === item.to || (currentPath === '/' && item.to === '/');

        return (
          <div
            key={item.label}
            className={`bottom-nav__item ${isActive ? 'is-active' : ''}`}
            onClick={() => handleNavClick(item.to)}
          >
            <i className={`${item.icon} bottom-nav__icon`}></i>
            <span className="bottom-nav__label">{item.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

export default BottomNav;
