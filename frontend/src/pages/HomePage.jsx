
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="page home">
      {/* 1. 히어로 (서비스 소개) */}
      <section className="home__hero">
        <div className="home__hero-emoji">🌞</div>
        <h1 className="home__title">
          내 피부에 딱 맞는
          <br />
          선케어 찾기
        </h1>
        <p className="home__subtitle">
          AI가 성분을 분석해서
          <br />
          당신에게 맞는 선크림을 추천해드려요
        </p>
      </section>

      {/* 2. 메인 CTA 카드 2개 */}
      <section className="home__cta">
        <div
          className="home__cta-card"
          onClick={() => navigate('/profile')}
        >
          <div className="home__cta-icon">💆</div>
          <h3 className="home__cta-title">맞춤 추천 받기</h3>
          <p className="home__cta-desc">
            내 피부 정보를 입력하고
            <br />
            추천 제품을 받아보세요
          </p>
          <Button size="lg">추천 받기 →</Button>
        </div>

        <div
          className="home__cta-card"
          onClick={() => navigate('/scan')}
        >
          <div className="home__cta-icon">📷</div>
          <h3 className="home__cta-title">기존 제품 분석</h3>
          <p className="home__cta-desc">
            제품 사진과 성분표를
            <br />
            올려 분석해보세요
          </p>
          <Button size="lg" variant="outline">
            분석하기 →
          </Button>
        </div>
      </section>

      {/* 3. 서비스 특징 */}
      <section className="home__features">
        <h2 className="home__features-title">SunCare의 특징</h2>
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
              <p>내 피부에 얼마나 맞는지 100점 만점으로</p>
            </div>
          </li>
          <li>
            <span className="home__features-emoji">🧴</span>
            <div>
              <strong>맞춤 세안 가이드</strong>
              <p>분석 결과에 맞는 케어 방법까지 제공</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  )
}

export default HomePage

// const navigate = useNavigate() → 페이지 이동 함수 생성
// navigate('/profile') → /profile 경로로 이동
// 카드(div) 전체에 onClick을 걸어서 카드 어디를 눌러도 이동