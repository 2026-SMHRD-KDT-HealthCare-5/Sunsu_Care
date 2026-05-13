import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/style.css';

const Main = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const startScan = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const icon = document.getElementById('uploadIcon');
    const title = document.getElementById('uploadTitle');
    
    icon.className = 'fa-solid fa-spinner fa-spin';
    icon.style.color = '#2563eb';
    title.innerText = 'AI 분석 중...';
    
    setTimeout(() => { navigate('/result'); }, 1500);
  };

  return (
    <div className="app-container">
      <header className="hero-section-header">
        <div className="logo">SUN-SCAN<span style={{ color: '#ff8c00' }}>.</span></div>
        <div className="header-icons">
          <i className="fa-regular fa-user" onClick={() => navigate('/login')}></i>
          <i className="fa-solid fa-bars" onClick={toggleMenu}></i>
        </div>
      </header>

      <main className="app-main" style={{ padding: 0 }}>
        <section className="hero-section" id="home">
          <div className="bg-slider">
            <div className={`bg-slide ${currentSlide === 0 ? 'active' : ''}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop')" }}></div>
            <div className={`bg-slide ${currentSlide === 1 ? 'active' : ''}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611624583204-62402127814b?q=80&w=800&auto=format&fit=crop')" }}></div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">내 피부에 맞는<br />선크림만<br />안전하게.</h1>
            <div className="action-bubbles">
              <div className="bubble-btn" onClick={() => navigate('/survey')}>쓰고 있는<br />선크림이 있어요</div>
              <div className="bubble-btn" onClick={() => navigate('/survey')}>새 선크림을<br />찾고 있어요</div>
            </div>
          </div>
        </section>

        <section className="content-section" id="recommend">
          <h2 className="section-title">AI 추천</h2>
          <p className="section-text">피부 타입 기반 추천 시스템<br />민감성 성분 필터링<br />사용자 맞춤 선케어 추천</p>
          <button className="start-btn" onClick={() => navigate('/survey')}>Start SUN-SCAN</button>
        </section>

        <section className="content-section" id="scan">
          <h2 className="section-title">AI 스캔</h2>
          <p className="section-text">선크림 뒷면 성분표를 촬영하거나<br />이미지를 업로드해 분석할 수 있습니다.</p>
          
          {/* 🌟 파일 글자 완벽하게 숨김 처리 (htmlFor 연결) */}
          <label className="upload-box" htmlFor="file-upload">
            <input type="file" id="file-upload" accept="image/*" onChange={startScan} style={{ display: 'none' }} />
            <i className="fa-solid fa-camera" id="uploadIcon"></i>
            <span id="uploadTitle">성분표 사진 업로드</span>
            <small style={{ color: '#888' }}>JPG, PNG 이미지 지원</small>
          </label>
        </section>

        <section className="content-section" id="info">
          <h2 className="section-title">선케어 정보</h2>
          <p className="section-text">선크림 관련 리뷰와 정보를<br />빠르게 확인해보세요.</p>
          <div className="info-card-wrap">
            <div className="info-card">
              <i className="fa-solid fa-blog"></i>
              <h3>블로그 정보</h3>
              <p>피부 타입별 선크림 추천<br />성분 분석 및 후기 확인</p>
              <button className="info-btn" onClick={() => window.open('https://m.search.naver.com/search.naver?query=선크림+추천+성분', '_blank')}>블로그 보기</button>
            </div>
            <div className="info-card">
              <i className="fa-brands fa-youtube"></i>
              <h3>유튜브 리뷰</h3>
              <p>인기 선크림 리뷰 영상<br />사용 후기 및 비교 분석</p>
              <button className="info-btn" onClick={() => window.open('https://m.youtube.com/results?search_query=디렉터파이+선크림+추천', '_blank')}>영상 보러가기</button>
            </div>
          </div>
        </section>
      </main>

      <nav className="bottom-nav">
        <div className="nav-item active" onClick={() => navigate('/')}><i className="fa-solid fa-house"></i><span>홈</span></div>
        <div className="nav-item" onClick={() => navigate('/survey')}><i className="fa-solid fa-wand-magic-sparkles"></i><span>AI추천</span></div>
        <div className="nav-item" onClick={() => document.getElementById('scan').scrollIntoView()}><i className="fa-solid fa-camera"></i><span>스캔</span></div>
        <div className="nav-item" onClick={() => document.getElementById('info').scrollIntoView()}><i className="fa-solid fa-circle-info"></i><span>정보</span></div>
      </nav>

      <div className={`side-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="menu-header">
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => { navigate('/login'); toggleMenu(); }}>
            <i className="fa-regular fa-circle-user" style={{ color: '#2563eb', fontSize: '26px', marginRight: '12px' }}></i>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>로그인이 필요합니다</span>
          </div>
          <i className="fa-solid fa-xmark" style={{ fontSize: '24px', cursor: 'pointer', color: '#111' }} onClick={toggleMenu}></i>
        </div>

        <div className="menu-list">
          <div className="menu-group">
            <div onClick={() => { navigate('/'); toggleMenu(); }}><div className="menu-item-left"><i className="fa-solid fa-house"></i> <span>HOME</span></div></div>
            <div onClick={() => { navigate('/survey'); toggleMenu(); }}><div className="menu-item-left"><i className="fa-solid fa-wand-magic-sparkles"></i> <span>AI 추천 맞춤케어</span></div></div>
            
            {/* 🌟 잃어버렸던 제품 성분 정밀분석(스캔) 메뉴 복구 */}
            <div onClick={() => { document.getElementById('scan').scrollIntoView(); toggleMenu(); }}><div className="menu-item-left"><i className="fa-solid fa-magnifying-glass-chart"></i> <span>제품 성분 정밀분석</span></div></div>
          </div>
          <div className="group-title">MY ACCOUNT</div>
          <div className="menu-group">
            <div onClick={() => { navigate('/profile'); toggleMenu(); }}><div className="menu-item-left"><i className="fa-solid fa-user-check"></i> <span>나의 피부 정보</span></div></div>
            <div onClick={() => { navigate('/history'); toggleMenu(); }}><div className="menu-item-left"><i className="fa-solid fa-history"></i> <span>분석 히스토리</span></div></div>
          </div>
          <div className="group-title">SERVICE</div>
          <div className="menu-group">
            <div onClick={() => { window.open('https://m.oliveyoung.co.kr', '_blank'); toggleMenu(); }}><div className="menu-item-left"><i className="fa-solid fa-bag-shopping"></i> <span>쇼핑</span></div></div>
          </div>
        </div>
      </div>

      <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}></div>
    </div>
  );
};

export default Main;