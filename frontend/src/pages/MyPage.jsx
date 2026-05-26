import { useAuth } from '../hooks/useAuth';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchProfile } from '../api/profileApi';
import './MyPage.css';

const MyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sliderRef = useRef(null);
    const { isLoggedIn, userNickname, userEmail } = useAuth();
    
    const [currentIndex, setCurrentIndex] = useState(1);
    const [mySkinInfo, setMySkinInfo] = useState({ type: "미설정", activity_env: "미설정", texture: "미설정", avoid: "미설정" });

    // 1. 히스토리 데이터 초기화 (Location State를 즉시 반영)
    const [historyData, setHistoryData] = useState(() => {
        const dummyData = [
            { id: 1, name: '메디힐 마데카소사이드 선세럼', date: '2026.05.14', score: 82, status: '적합', keyIng: ['나이아신', '산화아연'], warnIng: ['옥시벤존'] },
            { id: 2, name: '마일드 선크림', date: '2026.05.14', score: 95, status: '최적', keyIng: ['판테놀', '알란토인'], warnIng: [] },
        ];
        
        // ScanPage에서 넘어온 데이터가 있으면 맨 앞에 추가
        if (location.state?.newAnalysis) {
            const data = location.state.newAnalysis;
            const newItem = {
                id: 'new',
                name: '방금 분석한 제품',
                date: new Date().toLocaleDateString(),
                score: data.compatibility?.score || 85,
                status: data.ingredients?.is_suncare ? '적합' : '분석완료',
                keyIng: data.ingredients?.detected_ingredients?.slice(0, 3).map(i => i.name) || [],
                warnIng: data.ingredients?.detected_ingredients?.filter(i => i.warning !== '없음').map(i => i.name) || []
            };
            return [newItem, ...dummyData];
        }
        return dummyData;
    });

    // 프로필 정보 로드
    useEffect(() => {
        const loadProfile = async () => {
            if (!isLoggedIn) {
                setMySkinInfo({ type: "게스트", activity_env: "-", texture: "-", avoid: "-" });
                return;
            }
            try {
                const data = await fetchProfile();
                if (data) {
                    setMySkinInfo({
                        type: data.skin_type || "미설정",
                        activity_env: data.activity_env || "미설정",
                        texture: data.prod_type || "미설정",
                        avoid: (Array.isArray(data.avoid_ingredient) && data.avoid_ingredient.length > 0) ? data.avoid_ingredient.join(', ') : "없음"
                    });
                }
            } catch (error) {
                console.error("프로필 로드 실패:", error);
            }
        };
        loadProfile();
    }, [isLoggedIn]);

    // 슬라이더 조작 로직...
    const scrollSlider = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = sliderRef.current.offsetWidth; 
            sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const handleSliderScroll = () => {
        if (sliderRef.current) {
            const cardWidth = sliderRef.current.offsetWidth; 
            const newIndex = Math.round(sliderRef.current.scrollLeft / cardWidth) + 1;
            if (newIndex >= 1 && newIndex <= historyData.length) setCurrentIndex(newIndex);
        }
    };

    return (
        <div className="mypage-container">
            <h1>마이페이지</h1>

            {/* 사용자 카드 */}
            <div className="mypage-card">
                <div className="profile-info">
                    <div className="profile-icon">🌞</div>
                    <div>
                        <h2>{isLoggedIn ? (userNickname || userEmail || '사용자') : '게스트'}</h2>
                        <p>{isLoggedIn ? '오늘도 좋은 하루 보내세요 ☀️' : '로그인하고 분석 기록을 확인하세요'}</p>
                    </div>
                </div>
            </div>

            {/* 내 피부 정보 */}
            <div className="mypage-card">
                <div className="card-header">
                    <h3><i className="fa-solid fa-droplet"></i> 내 피부 정보</h3>
                    {isLoggedIn && (
                        <span className="edit-link" onClick={() => navigate('/profile')}>
                            수정하기 <i className="fa-solid fa-angle-right"></i>
                        </span>
                    )}
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

            {/* 🌟 [복원] 분석 히스토리 영역 (2번째 사진 레이아웃 전면 재배치) */}
            <div className="mypage-card history-section">
                <div className="history-header">
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
                            
                            {/* 🛠️ 2번째 사진 명세 스펙 그대로 마스터 복원 (미색/분홍색 박스 레이아웃) */}
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
                                        <div className="mini-ing-title" style={{ color: '#16a34a', marginBottom: 0 }}>
                                            <i className="fa-solid fa-shield-heart"></i> 주의 필요 성분 없음
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div 
                                    className="slide-card-footer" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        // 💡 클릭된 카드의 데이터를 상세 페이지로 전달
                                        navigate(`/history/${item.id}`, { 
                                            state: { 
                                                analysisData: {
                                                    productName: item.name,
                                                    score: item.score,
                                                    status: item.status,
                                                    keyIngredients: item.keyIng.map(name => ({ name, desc: "주요성분" })),
                                                    reason: "분석 결과에 따른 맞춤형 성분 리포트입니다.",
                                                    warnIngredients: item.warnIng.map(name => ({ name, desc: "주의성분" }))
                                                } 
                                            } 
                                        });
                                    }}
                                >
                                    상세 리포트 확인하기 <i className="fa-solid fa-arrow-right"></i>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 하단 단축 제어 버튼 세션 */}
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