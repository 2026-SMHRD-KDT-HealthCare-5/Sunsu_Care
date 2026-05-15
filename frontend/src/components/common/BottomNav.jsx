// src/components/common/BottomNav.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const ITEMS = [
  { to: '/', icon: 'fa-solid fa-house', label: '홈' },
  { to: '/#recommend', icon: 'fa-solid fa-wand-magic-sparkles', label: 'AI추천' },
  { to: '/#analysis', icon: 'fa-solid fa-magnifying-glass-chart', label: 'AI분석' },
  { to: '/guide', icon: 'fa-solid fa-pump-soap', label: '가이드' }, 
];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (to) => {
    navigate(to);

    if (to.startsWith('/#')) {
      const targetId = to.replace('/#', '');
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 60;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    } else {
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
            className={`bottom-nav_item ${isActive ? 'is-active' : ''}`}
            onClick={() => handleNavClick(item.to)}
            /* 🌟 padding을 12px -> 16px로 늘려서 하단 배너 높이를 키웠습니다 */
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '16px 0', textDecoration: 'none' }}
          >
            <i 
              className={item.icon} 
              style={{ 
                fontSize: '24px', /* 아이콘 크기 22px -> 24px 확대 */
                marginBottom: '6px', 
                /* 🌟 선택 안 된 기본 색상을 연회색에서 짙은 검정색(#333)으로 변경 */
                color: isActive ? '#ff8c00' : '#333',
                transition: 'color 0.2s'
              }}
            ></i>
            <span 
              className="bottom-nav_label" 
              style={{ 
                fontSize: '12px', /* 글씨 크기 11px -> 12px 확대 */
                /* 🌟 글씨 역시 짙은 검정색으로 변경 */
                color: isActive ? '#ff8c00' : '#333', 
                fontWeight: isActive ? '800' : '600',
                transition: 'all 0.2s'
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

export default BottomNav;