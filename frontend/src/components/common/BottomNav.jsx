// src/components/common/BottomNav.jsx
import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const ITEMS = [
  { to: '/',      icon: '🏠', label: '홈' },
  { to: '/scan',  icon: '🔍', label: 'AI분석' },
  { to: '/guide', icon: '🧴', label: '가이드' },
]

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? 'is-active' : ''}`
          }
        >
          <span className="bottom-nav__icon">{item.icon}</span>
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav