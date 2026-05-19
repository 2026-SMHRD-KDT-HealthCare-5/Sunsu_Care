import { useAuth } from '../hooks/useAuth';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

const MyPage = () => {
    const navigate = useNavigate();
    const sliderRef = useRef(null);
    
    const { isLoggedIn, userNickname, userEmail } = useAuth();
    const displayName = isLoggedIn ? (userNickname || userEmail || '사용자') : '게스트';
    const greeting = isLoggedIn ? '오늘도 좋은 하루 보내세요 ☀️' : 'SunCare에 오신 걸 환영해요';


    // 🌟 [중요 기능] 현재 슬라이드가 몇 번째인지 기억하는 State
    const [currentIndex, setCurrentIndex] = useState(1);

    // 피부 정보 샘플 데이터 (이건 그대로 유지)
    const mySkinInfo = {
        type: "건성",
        sensitivity: "민감성",
        texture: "무기자차 크림",
        avoid: "옥시벤존, 향료"
    };

    // 🌟 
    const historyData = [
        { id: 1, name: '솔', date: '2026.05.14', score: 82, status: '적합', keyIng: ['나이아신', '산화아연'], warnIng: ['옥시벤존'] },
        { id: 2, name: '마일드 선크림', date: '2026.05.14', score: 95, status: '최적', keyIng: ['판테놀'], warnIng: [] },
        { id: 3, name: '톤업 선밀크', date: '2026.05.13', score: 60, status: '주의', keyIng: ['징크옥사이드'], warnIng: ['에탄올'] },
        { id: 4, name: '새로운 샘플 1', date: '2026.05.13', score: 88, status: '적합', keyIng: ['히알루론산'], warnIng: [] },
        { id: 5, name: '새로운 샘플 2', date: '2026.05.12', score: 77, status: '주의', keyIng: ['세라마이드'], warnIng: ['향료'] },
    ];

    // 화살표 스크롤 함수는 그대로 유지
    const scrollSlider = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = sliderRef.current.offsetWidth; 
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // 🌟 스크롤 할 때마다 몇 번째인지 계산해서 숫자를 바꿉니다!
    const handleSliderScroll = () => {
        if (sliderRef.current) {
            const scrollLeft = sliderRef.current.scrollLeft; // 현재 스크롤된 거리
            const cardWidth = sliderRef.current.offsetWidth; // 카드 1개의 너비
            
            // 현재 몇 번째 카드인지 계산 (1부터 시작하게 +1)
            const newIndex = Math.round(scrollLeft / cardWidth) + 1;
            
            // 숫자가 바뀌었을 때만 State를 업데이트해서 화면을 다시 그립니다.
            if (newIndex !== currentIndex) {
                setCurrentIndex(newIndex);
            }
        }
    };

    return (
        <div className="mypage-container">
            <h1 style={{ padding: '20px', margin: 0, fontSize: '1.5rem' }}>마이페이지</h1>

            {/* 사용자 정보 */}
            <div className="mypage-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="profile-icon">🌞</div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{displayName}</h2>
                        <p style={{ margin: 0, color: '#666' }}>{greeting}</p>  
                    </div>
                </div>
            </div>

            {/* 내 피부 정보 (그리드 스타일 그대로 유지) */}
            <div className="mypage-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, display:'flex', gap:'8px', alignItems:'center' }}>
                        <i className="fa-solid fa-droplet" style={{color: '#3b82f6'}}></i> 내 피부 정보
                    </h3>
                    <span style={{ color: '#ff8c00', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }} onClick={() => navigate('/profile')}>
                        수정하기 <i className="fa-solid fa-angle-right"></i>
                    </span>
                </div>
                
                <div className="skin-info-grid">
                    <div className="skin-info-item">
                        <span className="info-label">피부 타입</span>
                        <span className="info-value tag-blue">{mySkinInfo.type}</span>
                    </div>
                    <div className="skin-info-item">
                        <span className="info-label">민감도</span>
                        <span className="info-value tag-red">{mySkinInfo.sensitivity}</span>
                    </div>
                    <div className="skin-info-item">
                        <span className="info-label">선호 제형</span>
                        <span className="info-value tag-gray">{mySkinInfo.texture}</span>
                    </div>
                    <div className="skin-info-item">
                        <span className="info-label">기피 성분</span>
                        <span className="info-value tag-outline">{mySkinInfo.avoid}</span>
                    </div>
                </div>
            </div>

            {/* 🌟 분석 히스토리 (타이틀 변경 & 스크롤 감지 추가) */}
            <div className="mypage-card history-section">
                <div className="history-header">
                    {/* 🌟 타이틀 수정: 분석 히스토리 (현재번째/총개수) */}
                    <h3 style={{ margin: 0 }}>📊 분석 히스토리 ({currentIndex}/{historyData.length})</h3>
                    <div className="slider-controls">
                        <button onClick={() => scrollSlider('left')} className="slider-arrow">
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <button onClick={() => scrollSlider('right')} className="slider-arrow">
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                {/* 🌟 중요: onScroll 이벤트를 달아서 스크롤을 감지하게 합니다! */}
                <div className="history-slider" ref={sliderRef} onScroll={handleSliderScroll}>
                    {historyData.map((item) => (
                        <div key={item.id} className="history-slide-card" onClick={() => navigate(`/history/${item.id}`)}>
                            <div className="slide-card-header">
                                <div>
                                    <h4 className="slide-card-title">{item.name}</h4>
                                    <span className="slide-card-date">{item.date}</span>
                                </div>
                                <div className="slide-card-score-box">
                                    <span className="score-num">{item.score}</span>
                                    <span className={`status-badge ${item.status === '부적합' || item.status === '주의' ? 'warn' : 'safe'}`}>{item.status}</span>
                                </div>
                            </div>
                            
                            {/* 🌟 카드 중단: 2번째 사진처럼 디테일하게 복구된 영역! */}
                            <div className="slide-card-body">
                                <div className="mini-ing-section key">
                                    {/* 이 부분이 다시 살아났습니다! */}
                                    <div className="mini-ing-title">
                                        <i className="fa-solid fa-gem"></i> 매칭된 핵심 성분
                                    </div>
                                    <div className="mini-ing-tags">
                                        {item.keyIng.map((ing, idx) => <span key={idx} className="mini-tag">{ing}</span>)}
                                    </div>
                                </div>

                                {item.warnIng && item.warnIng.length > 0 && (
                                    <div className="mini-ing-section warn">
                                        {/* 이 부분이 다시 살아났습니다! */}
                                        <div className="mini-ing-title">
                                            <i className="fa-solid fa-triangle-exclamation"></i> 주의 성분 발견
                                        </div>
                                        <div className="mini-ing-tags">
                                            {item.warnIng.map((ing, idx) => <span key={idx} className="mini-tag">{ing}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="slide-card-footer">상세 리포트 확인하기 <i className="fa-solid fa-arrow-right"></i></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🌟 하단 버튼: 2개로 나누어 배치 */}
            <div className="action-btn-container">
                <button className="re-analyze-btn" onClick={() => navigate('/scan')}>
                    <i className="fa-solid fa-rotate-right"></i> 다시 분석
                </button>
            {isLoggedIn ? (
               <button className="logout-btn-half" onClick={() => navigate('/logout')}>
                  <i className="fa-solid fa-arrow-right-from-bracket"></i> 로그아웃
                </button>
             ) : (
                <button className="logout-btn-half" onClick={() => navigate('/login')}>
                    <i className="fa-solid fa-arrow-right-to-bracket"></i> 로그인
                </button>
            )}
            </div>

        </div>
    );
};

export default MyPage;