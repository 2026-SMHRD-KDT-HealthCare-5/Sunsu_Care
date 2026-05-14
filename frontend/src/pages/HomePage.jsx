
import { useNavigate } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home">
      {/* 1. 히어로 — 큰 이미지 + 텍스트 + 둥근 버튼 2개 */}
      <section className="home__hero">
        
        <div className="home__hero-text">
          <h1 className="home__hero-title">
            필요한 것만
            <br />
            충분하게.
          </h1>
        </div>

        <div className="home__hero-buttons">
          {/* 왼쪽 버튼 + 다중 링 */}
          <div className="home__circle-wrap home__circle-wrap--a">
            <span className="home__ring home__ring--1" />
            <span className="home__ring home__ring--2" />
            <span className="home__ring home__ring--3" />
            <button
              type="button"
              className="home__circle-btn"
              onClick={() => navigate('/profile')}
            >
              맞춤 추천
              <br />
              받기
            </button>
          </div>

          {/* 오른쪽 버튼 + 다중 링 (위상 차이) */}
          <div className="home__circle-wrap home__circle-wrap--b">
            <span className="home__ring home__ring--1" />
            <span className="home__ring home__ring--2" />
            <span className="home__ring home__ring--3" />
            <button
              type="button"
              className="home__circle-btn"
              onClick={() => navigate('/scan')}
            >
              기존 제품
              <br />
              분석
            </button>
          </div>
        </div>
      </section>

      {/* 2. 베이지 인트로 */}
      <section className="home__intro">
        <h2 className="home__intro-title">
          내 피부에 맞는 성분만
          <br />
          하나의 추천으로 충분하다.
        </h2>

        <ul className="home__intro-list">
          <li>
            <span className="home__intro-mark">+</span>
            내 피부에 맞는 것을 더하고
          </li>
          <li>
            <span className="home__intro-mark">−</span>
            불필요한 성분은 덜어내고
          </li>
          <li>
            <span className="home__intro-mark">×</span>
            어울리는 것끼리 조합하여
          </li>
          <li>
            <span className="home__intro-mark">○</span>
            하나의 추천으로 담아내다
          </li>
        </ul>

        <button
          type="button"
          className="home__start-btn"
          onClick={() => navigate('/profile')}
        >
          Start AI 분석
        </button>
      </section>

      {/* 3. WHY 섹션 */}
      <section className="home__why">
        <h2 className="home__why-title">WHY SUNCARE___</h2>
        <ul className="home__features-list">
          <li>
            <span className="home__features-emoji">🔍</span>
            <div>
              <strong>YOLO + OCR 분석</strong>
              <p>제품과 성분을 자동으로 인식해요</p>
            </div>
          </li>
          <li>
            <span className="home__features-emoji">💯</span>
            <div>
              <strong>피부 적합도 점수</strong>
              <p>내 피부에 얼마나 맞는지 100점 만점</p>
            </div>
          </li>
          <li>
            <span className="home__features-emoji">🧴</span>
            <div>
              <strong>맞춤 세안 가이드</strong>
              <p>결과에 맞는 케어 방법까지 제공</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  )
}

export default HomePage