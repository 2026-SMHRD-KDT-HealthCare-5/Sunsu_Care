import { useAuth } from '../hooks/useAuth';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

const MyPage = () => {
    const navigate = useNavigate();
    const sliderRef = useRef(null);

    const { isLoggedIn, userNickname, userEmail } = useAuth();
    const displayName = isLoggedIn ? (userNickname || userEmail || '사용자') : '게스트';
    
    // 🌟 이니셜 추출 로직 (로그인 시 닉네임 첫 글자, 없으면 'S')
    const userInitial = isLoggedIn && userNickname ? userNickname.charAt(0) : 'S';

    const [currentIndex, setCurrentIndex] = useState(1);
    const [mySkinInfo, setMySkinInfo] = useState({
        type: "-",
        activity_env: "-",
        texture: "-",
        avoid: "-"
    });

    useEffect(() => {
        const loadProfile = async () => {
            if (!isLoggedIn) return;
            try {
                const data = await fetchProfile();
                if (data) {
                    setMySkinInfo({
                        type: data.skin_type || "미설정",
                        activity_env: data.activity_env || "미설정",
                        texture: data.prod_type || "미설정",
                        avoid: Array.isArray(data.avoid_ingredient)
                            ? data.avoid_ingredient.join(', ')
                            : (data.avoid_ingredient || "미설정")
                    });
                }
            } catch (error) {
                console.error("프로필 정보를 불러오지 못했습니다.", error);
            }
        };
        loadProfile();
    }, [isLoggedIn]);

    // 🌟 히스토리 배열 데이터
    const historyData = useMemo(() => {
        return [
            { id: 1, name: '메디힐 마데카소사이드 선세럼', date: '2026.05.14', score: 82, status: '적합', keyIng: ['나이아신', '산화아연'], warnIng: ['옥시벤존'] },
            { id: 2, name: '마일드 선크림', date: '2026.05.14', score: 95, status: '최적', keyIng: ['판테놀', '알란토인'], warnIng: [] },
            { id: 3, name: '톤업 선밀크', date: '2026.05.13', score: 60, status: '주의', keyIng: ['징크옥사이드'], warnIng: ['에탄올'] },
            { id: 4, name: '닥터지 그린 마일드 업 선', date: '2026.05.12', score: 88, status: '적합', keyIng: ['징크옥사이드', '히알루론산'], warnIng: [] },
            { id: 5, name: '이니스프리 수분 선크림', date: '2026.05.11', score: 75, status: '주의', keyIng: ['세라마이드'], warnIng: ['향료'] }
        ];
    }, []);

    const scrollSlider = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = sliderRef.current.offsetWidth;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleSliderScroll = () => {
        if (sliderRef.current) {
            const scrollLeft = sliderRef.current.scrollLeft;
            const cardWidth = sliderRef.current.offsetWidth;
            const newIndex = Math.round(scrollLeft / cardWidth) + 1;

            if (newIndex !== currentIndex && newIndex >= 1 && newIndex <= historyData.length) {
                setCurrentIndex(newIndex);
            }
        }
    };

    return (
        <div className="mypage-container">
            <h1 style={{ padding: '20px', margin: 0, fontSize: '1.5rem' }}>마이페이지</h1>

            {/* ── 사용자 카드 ── */}
            <div className="mypage-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    
                    
                    <div style={{ 
                        width: '55px', height: '55px', borderRadius: '50%', 
                        backgroundColor: '#ff8c00', color: '#ffffff', 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', 
                        fontWeight: '800', fontSize: '1.5rem', flexShrink: 0,
                        border: '2px solid #fff3e0'
                    }}>
                        {userInitial}
                    </div>

                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{displayName}</h2>
                       
                        <div style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            {isLoggedIn ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    오늘도 좋은 하루 보내세요 <i className="fa-solid fa-sun" style={{ color: '#ff8c00' }}></i>
                                </span>
                            ) : (
                                'SunCare에 오신 걸 환영해요'
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 내 피부 정보 ── */}
            <div className="mypage-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <i className="fa-solid fa-droplet" style={{ color: '#3b82f6' }}></i> 내 피부 정보
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
                        <span className="info-label">활동 환경</span>
                        <span className="info-value tag-blue">{mySkinInfo.activity_env}</span>
                    </div>
                    <div className="skin-info-item">
                        <span className="info-label">선호 제형</span>
                        <span className="info-value tag-gray">{mySkinInfo.texture}</span>
                    </div>
                    <div className="skin-info-item">
                        <span className="info-label">기피 성분</span>
                        <span className="info-value tag-green">{mySkinInfo.avoid}</span>
                    </div>
                </div>
            </div>

            {/* ── 분석 히스토리 ── */}
            <div className="mypage-card history-section">
                <div className="history-header">
                    <h3 style={{ margin: 0 }}>📊 분석 히스토리 ({historyData.length > 0 ? currentIndex : 0}/{historyData.length})</h3>
                    <div className="slider-controls">
                        <button
                            onClick={() => scrollSlider('left')}
                            className="slider-arrow"
                            disabled={currentIndex <= 1}
                            style={{
                                opacity: currentIndex <= 1 ? 0.3 : 1,
                                cursor: currentIndex <= 1 ? 'default' : 'pointer',
                                backgroundColor: currentIndex <= 1 ? '#f8fafc' : '#fff'
                            }}
                        >
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>

                        <button
                            onClick={() => scrollSlider('right')}
                            className="slider-arrow"
                            disabled={currentIndex >= historyData.length}
                            style={{
                                opacity: currentIndex >= historyData.length ? 0.3 : 1,
                                cursor: currentIndex >= historyData.length ? 'default' : 'pointer',
                                backgroundColor: currentIndex >= historyData.length ? '#f8fafc' : '#fff'
                            }}
                        >
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                <div className="history-slider" ref={sliderRef} onScroll={handleSliderScroll}>
                    {historyData.map((item) => (
                        <div key={item.id} className="history-slide-card">
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

                            <div className="slide-card-body">
                                <div className="mini-ing-section key">
                                    <div className="mini-ing-title">
                                        <i className="fa-solid fa-gem"></i> 매칭된 핵심 성분
                                    </div>
                                    <div className="mini-ing-tags">
                                        {item.keyIng.map((ing, idx) => (
                                            <span key={idx} className="mini-tag">{ing}</span>
                                        ))}
                                    </div>
                                </div>

                                {item.warnIng && item.warnIng.length > 0 ? (
                                    <div className="mini-ing-section warn">
                                        <div className="mini-ing-title">
                                            <i className="fa-solid fa-triangle-exclamation"></i> 주의 성분 발견
                                        </div>
                                        <div className="mini-ing-tags">
                                            {item.warnIng.map((ing, idx) => (
                                                <span key={idx} className="mini-tag">{ing}</span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mini-ing-section safe-clean">
                                        <div className="mini-ing-title" style={{ color: ' #ef4444', marginBottom: 0 }}>
                                            <i className="fa-solid fa-shield-heart"></i> 주의 필요 성분 없음
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="slide-card-footer" onClick={() => navigate(`/history/${item.id}`)} style={{ cursor: 'pointer' }}>
                                상세 리포트 확인하기 <i className="fa-solid fa-arrow-right"></i>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* ── 하단 단축 제어 버튼 ── */}

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