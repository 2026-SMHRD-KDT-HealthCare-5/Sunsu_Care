
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { getProfile, getHistory } from '../utils/storage'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/formatDate'
import './MyPage.css'

function getStatusClass(status) {
  if (status === '적합') return 'is-success'
  if (status === '주의') return 'is-warning'
  return 'is-danger'
}

function MyPage() {
  const navigate = useNavigate()
  const { userEmail, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    setProfile(getProfile())
    setHistory(getHistory())
  }, [])

  const handleLogout = () => {
    logout()
    setShowLogout(false)
    navigate('/')
  }

  return (
    <div className="page my">
      <div className="my__page-header">
        <h1 className="my__page-title">마이페이지</h1>
      </div>

      {/* 사용자 정보 */}
      <section className="my__section">
        <h2 className="my__section-title">👤 사용자 정보</h2>
        <div className="my__user">
          <div className="my__avatar">🌞</div>
          <div className="my__user-info">
            <p className="my__email">{userEmail || '게스트'}</p>
            <p className="my__welcome">SunCare에 오신 걸 환영해요</p>
          </div>
        </div>
      </section>

      {/* 피부 프로필 */}
      <section className="my__section">
        <div className="my__section-head">
          <h2 className="my__section-title">💆 내 피부 정보</h2>
          <button
            type="button"
            className="my__edit"
            onClick={() => navigate('/profile')}
          >
            {profile ? '수정' : '입력'} →
          </button>
        </div>

        {profile ? (
          <ul className="my__profile">
            <li><strong>피부 타입</strong><span>{profile.skinType || '-'}</span></li>
            <li><strong>민감도</strong><span>{profile.sensitive ? '민감' : '보통'}</span></li>
            <li><strong>선호 타입</strong><span>{profile.preferType || '-'}</span></li>
            <li><strong>피부 고민</strong><span>{profile.concerns?.join(', ') || '-'}</span></li>
            <li><strong>기피 성분</strong><span>{profile.avoidIngredients?.join(', ') || '-'}</span></li>
          </ul>
        ) : (
          <p className="my__empty">아직 피부 정보를 입력하지 않았어요.</p>
        )}
      </section>

      {/* 분석 히스토리 */}
      <section className="my__section">
        <h2 className="my__section-title">📊 분석 히스토리 ({history.length})</h2>

        {history.length === 0 ? (
          <div className="my__empty-block">
            <p className="my__empty">아직 분석한 제품이 없어요.</p>
            <Button onClick={() => navigate('/scan')}>
              제품 분석하러 가기 →
            </Button>
          </div>
        ) : (
          <ul className="my__history">
            {history.map((item) => (
              <li
                key={item.id}
                className="my__history-item"
                onClick={() => navigate(`/history/${item.id}`)}
              >
                <div className="my__history-main">
                  <h3 className="my__history-name">{item.productName}</h3>
                  <p className="my__history-date">{formatDate(item.createdAt)}</p>
                </div>
                <div className={`my__history-score ${getStatusClass(item.status)}`}>
                  <span className="my__history-num">{item.score}</span>
                  <span className="my__history-badge">{item.status}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button
        variant="outline"
        size="lg"
        onClick={() => setShowLogout(true)}
      >
        🚪 로그아웃
      </Button>

      <Modal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        title="로그아웃"
        hideDefaultButton
      >
        정말 로그아웃 하시겠어요?
        <br />
        저장된 정보가 모두 삭제됩니다.
        <div className="my__modal-actions">
          <Button variant="outline" onClick={() => setShowLogout(false)}>
            취소
          </Button>
          <Button onClick={handleLogout}>로그아웃</Button>
        </div>
      </Modal>
    </div>
  )
}

export default MyPage