// src/components/common/Header.jsx
import { Link, NavLink } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <Link to="/" className="header__logo">
        🌞 SunCare
      </Link>

      <nav className="header__nav">
        <NavLink to="/scan" className="header__link">스캔</NavLink>
        <NavLink to="/guide" className="header__link">가이드</NavLink>
        <NavLink to="/mypage" className="header__link">마이</NavLink>
        <NavLink to="/login" className="header__link">로그인</NavLink>
      </nav>
    </header>
  )
}

export default Header