
// src/components/common/Header.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const { isLoggedIn, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const goTo = (path) => {
    setMenuOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    logout()           // ← 훅에서 받은 logout 사용
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="header">
      <Link to="/" className="header__logo">🌞 SunCare</Link>

      <div className="header__actions" ref={menuRef}>
        <button
          type="button"
          className="header__icon-btn"
          onClick={() => navigate(isLoggedIn ? '/mypage' : '/login')}
          aria-label={isLoggedIn ? '마이페이지' : '로그인'}
        >
          👤
        </button>

        <button
          type="button"
          className="header__icon-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="메뉴"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {menuOpen && (
          <nav className="header__menu">
            <button type="button" className="header__menu-item" onClick={() => goTo('/scan')}>
              🔍 스캔
            </button>
            <button type="button" className="header__menu-item" onClick={() => goTo('/guide')}>
              🧴 가이드
            </button>
            <button type="button" className="header__menu-item" onClick={() => goTo('/mypage')}>
              👤 마이
            </button>
            <div className="header__menu-divider" />
            {isLoggedIn ? (
              <button
                type="button"
                className="header__menu-item header__menu-item--danger"
                onClick={handleLogout}
              >
                🚪 로그아웃
              </button>
            ) : (
              <button type="button" className="header__menu-item" onClick={() => goTo('/login')}>
                🔑 로그인
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header