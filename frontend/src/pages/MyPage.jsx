import { useAuth } from '../hooks/useAuth';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchProfile } from '../api/profileApi';
import { fetchHistory } from '../api/analysisApi';
import { calculateCompatibility } from '../utils/compatibilityScore';
import './MyPage.css';

const MyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sliderRef = useRef(null);
    const { isLoggedIn, userNickname, userEmail } = useAuth();
    
    // 상태 정의
    const [historyData, setHistoryData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(1);
    const [mySkinInfo, setMySkinInfo] = useState({ type: "미설정", activity_env: "미설정", texture: "미설정", avoid: "미설정" });

    const newAnalysisTrigger = JSON.stringify(location.state?.newAnalysis);

    useEffect(() => {
        // 🌟 로그아웃 시 이전 데이터 초기화
        if (!isLoggedIn) {
            setHistoryData([]);
            setMySkinInfo({ type: "미설정", activity_env: "미설정", texture: "미설정", avoid: "미설정" });
            setCurrentIndex(1);
            return;
        }

        const loadPageData = async () => {
            console.log('🟢 [MyPage] location.state:', location.state);
            console.log('🟢 [MyPage] newAnalysis raw:', location.state?.newAnalysis);

            let finalHistory = [];

            // 🌟 프로필 먼저 로드 (점수 계산에 필요)
            let userProfile = null;
            try {
                userProfile = await fetchProfile();
                if (userProfile) {
                    setMySkinInfo({
                        type: userProfile.skin_type || "미설정",
                        activity_env: userProfile.activity_env || "미설정",
                        texture: userProfile.prod_type || "미설정",
                        avoid: (Array.isArray(userProfile.avoid_ingredient) && userProfile.avoid_ingredient.length > 0)
                                ? userProfile.avoid_ingredient.join(', ') : "없음"
                    });
                }
            } catch (err) {
                console.error("프로필 로드 실패:", err);
            }

            // 1. DB에서 과거 내역 가져오기
            try {
                const dbData = await fetchHistory();
                console.log('🟡 [MyPage] DB fetchHistory 결과:', dbData);
                if (dbData && Array.isArray(dbData)) {
                    finalHistory = dbData.map(item => ({
                        id: item.analysis_idx,
                        name: item.prod_name || '분석된 제품',
                        date: new Date(item.joined_at).toLocaleDateString(),
                        score: item.match_score || 0,
                        status: item.match_status || (item.match_score >= 75 ? '적합' : '주의'),
                        keyIng: item.key_ingredients ? item.key_ingredients.split(',') : [],
                        warnIng: item.warn_ingredients ? item.warn_ingredients.split(',') : []
                    }));
                }
            } catch (err) {
                console.error("히스토리 로드 실패:", err);
            }

            // 2. ScanPage에서 넘어온 실시간 분석 데이터가 있다면 맨 앞에 추가
            if (location.state?.newAnalysis) {
                const data = location.state.newAnalysis;
                const detectedIngredients = data.ingredients?.detected_ingredients || [];

                const keyIngredients = detectedIngredients
                    .filter(i => i.skin_warning && (i.skin_warning.includes('도움') || i.skin_warning.includes('기능성')))
                    .slice(0, 3)
                    .map(i => i.ingre_name);

                const warnIngredients = detectedIngredients
                    .filter(i => i.ewg_grade >= 3)
                    .slice(0, 3)
                    .map(i => i.ingre_name);

                const { score: calcScore, status: calcStatus } = calculateCompatibility(
                    detectedIngredients,
                    userProfile || {}
                );

                const newItem = {
                    id: data.analysis_idx || 'new-' + Date.now(),
                    name: data.prod_name || '방금 분석한 제품',
                    date: new Date().toLocaleDateString(),
                    score: calcScore,
                    status: calcStatus,
                    keyIng: keyIngredients,
                    warnIng: warnIngredients
                };

                let isExist = finalHistory.some(item => item.id === newItem.id);

                if (!isExist) {
                    const newFingerprint = detectedIngredients.map(i => i.ingre_name).sort().join('|');
                    isExist = finalHistory.some(item => {
                        const itemFingerprint = [
                            ...(item.keyIng || []),
                            ...(item.warnIng || [])
                        ].sort().join('|');
                        return itemFingerprint && itemFingerprint === [
                            ...newItem.keyIng,
                            ...newItem.warnIng
                        ].sort().join('|');
                    });
                }

                if (!isExist) {
                    finalHistory = [newItem, ...finalHistory];
                }
            }

            // 데이터 없을 시 더미 데이터
            if (finalHistory.length === 0) {
                finalHistory = [
                    { id: 1, name: '메디힐 마데카소사이드 선세럼', date: '2026.05.14', score: 82, status: '적합', keyIng: ['나이아신', '산화아연'], warnIng: ['옥시벤존'] },
                    { id: 2, name: '마일드 선크림', date: '2026.05.14', score: 95, status: '최적', keyIng: ['판테놀', '알란토인'], warnIng: [] }
                ];
            }

            setHistoryData(finalHistory);
            setCurrentIndex(1);
        };

        loadPageData();
        
    }, [isLoggedIn, newAnalysisTrigger]);

    // 슬라이더 제어 로직
    const scrollSlider = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = sliderRef.current.offsetWidth;
            sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const handleSliderScroll = () => {
        if (sliderRef.current) {
            const cardWidth = sliderRef.current.offsetWidth;
            const scrollLeft = sliderRef.current.scrollLeft;
            const newIndex = Math.round(scrollLeft / cardWidth) + 1;
            
            if (newIndex !== currentIndex && newIndex >= 1 && newIndex <= historyData.length) {
                setCurrentIndex(newIndex);
            }
        }
    };

    const displayName = isLoggedIn ? (userNickname || userEmail || '사용자') : '게스트';
    const greeting = isLoggedIn ? '오늘도 좋은 하루 보내세요 ☀️' : 'SunCare에 오신 걸 환영해요';

    return (
        <div className="mypage-container">
            {/* 🌟 CSS 복원: 페이지 상단 제목 */}
            <h1 className="mypage-title">
                <i className="fa-solid fa-user-check"></i>
                나의 피부 정보
            </h1>

            {/* ── 사용자 카드 ── */}
            <div 
                className="mypage-card" 
                onClick={() => navigate('/account-settings')} 
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            >
                <div className="mypage-user-info">
                    <div className="profile-icon">🌞</div>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>{displayName}</h2>
                            <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1' }}></i>
                        </div>
                        <p>{greeting}</p>
                    </div>
                </div>
            </div>

            {/* ── 내 피부 정보 (4분할 그리드) ── */}
            <div className="mypage-card">
                <div className="mypage-card-header">
                    <h3 className="mypage-card-title">
                        <i className="fa-solid fa-droplet icon-droplet"></i> 내 피부 정보
                    </h3>
                    <span className="mypage-card-link" onClick={() => navigate('/profile')}>
                        수정하기 <i className="fa-solid fa-angle-right"></i>
                    </span>
                </div>

                <div className="skin-info-grid">
                    <div className="skin-info-item">
                        <span className="info-label">피부 타입</span>
                        <span className="info-value tag">{mySkinInfo.type}</span>
                    </div>
                    <div className="skin-info-item">
                        <span className="info-label">활동 환경</span>
                        <span className="info-value tag">{mySkinInfo.activity_env}</span>
                    </div>
                    <div className="skin-info-item">
                        <span className="info-label">선호 제형</span>
                        <span className="info-value tag">{mySkinInfo.texture}</span>
                    </div>
                    <div className="skin-info-item">
                        <span className="info-label">기피 성분</span>
                        <span className="info-value tag">{mySkinInfo.avoid}</span>
                    </div>
                </div>
            </div>

            {/* ── 분석 히스토리 ── */}
            <div className="mypage-card history-section">
                <div className="history-header">
                    <h3 className="mypage-history-title">📊 분석 히스토리 ({historyData.length > 0 ? currentIndex : 0}/{historyData.length})</h3>
                    <div className="slider-controls">
                        {/* CSS :hover 효과를 위해 비활성 상태의 스타일만 인라인으로 최소한 적용 */}
                        <button 
                            onClick={() => scrollSlider('left')} 
                            className="slider-arrow"
                            disabled={currentIndex <= 1}
                            style={currentIndex <= 1 ? { opacity: 0.3, cursor: 'default', backgroundColor: '#f8fafc' } : {}}
                        >
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>

                        <button 
                            onClick={() => scrollSlider('right')} 
                            className="slider-arrow"
                            disabled={currentIndex >= historyData.length}
                            style={currentIndex >= historyData.length ? { opacity: 0.3, cursor: 'default', backgroundColor: '#f8fafc' } : {}}
                        >
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                <div className="history-slider" ref={sliderRef} onScroll={handleSliderScroll}>
                    {historyData.map((item) => (
                        /* 🌟 CSS 복원: wrapper 태그 부활 및 날짜 외부 배치 */
                        <div key={item.id} className="history-slide-wrapper">
                            <span className="slide-date-top">{item.date}</span>
                            
                            <div className="history-slide-card">
                                {/* 🌟 CSS 복원: 제품명 제거 후 중앙 정렬된 점수 박스 */}
                                <div className="slide-card-score-area">
                                    <span className="score-num">
                                        {item.score}<span className="score-total"> / 100</span>
                                    </span>
                                    <span className={`status-badge ${item.status === '적합' || item.status === '최적' ? 'safe' : 'warn'}`}>
                                        {item.status}
                                    </span>
                                </div>
                                
                                <div className="slide-card-body">
                                    <div className="mini-ing-section key">
                                        <div className="mini-ing-title">
                                            <i className="fa-solid fa-gem"></i> 매칭된 핵심 성분
                                        </div>
                                        <div className="mini-ing-tags">
                                            {item.keyIng.length > 0 
                                                ? item.keyIng.map((ing, i) => <span key={i} className="mini-tag">{ing}</span>)
                                                : <span className="mini-tag empty">매칭된 핵심 성분 없음</span>}
                                        </div>
                                    </div>

                                    {item.warnIng && item.warnIng.length > 0 ? (
                                        <div className="mini-ing-section warn">
                                            <div className="mini-ing-title">
                                                <i className="fa-solid fa-triangle-exclamation"></i> 주의 성분 발견
                                            </div>
                                            <div className="mini-ing-tags">
                                                {item.warnIng.map((ing, i) => <span key={i} className="mini-tag">{ing}</span>)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mini-ing-section safe-clean">
                                            <div className="mini-ing-title">
                                                <i className="fa-solid fa-shield-heart"></i> 주의 필요 성분 없음
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="slide-card-footer" onClick={() => navigate(`/history/${item.id}`, { state: { analysisData: item } })}>
                                    상세 리포트 확인하기 <i className="fa-solid fa-arrow-right"></i>
                                </div>
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