import { useAuth } from '../hooks/useAuth';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchProfile } from '../api/profileApi';
import { fetchHistory } from '../api/analysisApi';
import './MyPage.css';

const MyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sliderRef = useRef(null);
    const { isLoggedIn, userNickname, userEmail } = useAuth();
    
    // 상태 정의 통합
    const [historyData, setHistoryData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(1);
    const [mySkinInfo, setMySkinInfo] = useState({ type: "미설정", activity_env: "미설정", texture: "미설정", avoid: "미설정" });

    useEffect(() => {
        const loadPageData = async () => {
            if (!isLoggedIn) return;

            let finalHistory = [];

            // 1. DB에서 과거 내역 가져오기
            try {
                const dbData = await fetchHistory();
                if (dbData && Array.isArray(dbData)) {
                    finalHistory = dbData.map(item => ({
                        id: item.analysis_idx,
                        name: item.prod_name || '분석된 제품',
                        date: new Date(item.joined_at).toLocaleDateString(),
                        score: item.match_score || 0,
                        status: item.match_score >= 80 ? '적합' : '주의',
                        keyIng: item.key_ingredients ? item.key_ingredients.split(',') : [],
                        warnIng: item.warn_ingredients ? item.warn_ingredients.split(',') : []
                    }));
                }
            } catch (err) {
                console.error("히스토리 로드 실패:", err);
            }

            // 2. ScanPage에서 방금 넘어온 따끈따끈한 데이터가 있다면 맨 앞에 추가
            if (location.state?.newAnalysis) {
                const data = location.state.newAnalysis;
                const newItem = {
                    id: 'new-' + Date.now(),
                    name: '방금 분석한 제품',
                    date: new Date().toLocaleDateString(),
                    score: data.compatibility?.score || 85,
                    status: (data.compatibility?.score >= 80) ? '적합' : '주의',
                    keyIng: data.ingredients?.detected_ingredients?.slice(0, 3).map(i => i.name) || [],
                    warnIng: data.ingredients?.detected_ingredients?.filter(i => i.warning !== '없음').map(i => i.name) || []
                };
                finalHistory = [newItem, ...finalHistory];
            }

            // 만약 아무 데이터도 없다면 더미 데이터라도 보여주기 (테스트용)
            if (finalHistory.length === 0) {
                finalHistory = [
                    { id: 1, name: '메디힐 마데카소사이드 선세럼', date: '2026.05.14', score: 82, status: '적합', keyIng: ['나이아신', '산화아연'], warnIng: ['옥시벤존'] },
                    { id: 2, name: '마일드 선크림', date: '2026.05.14', score: 95, status: '최적', keyIng: ['판테놀', '알란토인'], warnIng: [] }
                ];
            }

            setHistoryData(finalHistory);

            // 3. 프로필 정보 로드
            try {
                const profile = await fetchProfile();
                if (profile) {
                    setMySkinInfo({
                        type: profile.skin_type || "미설정",
                        activity_env: profile.activity_env || "미설정",
                        texture: profile.prod_type || "미설정",
                        avoid: (Array.isArray(profile.avoid_ingredient) && profile.avoid_ingredient.length > 0) 
                                ? profile.avoid_ingredient.join(', ') : "없음"
                    });
                }
            } catch (err) { console.error("프로필 로드 실패:", err); }
        };

        loadPageData();
    }, [isLoggedIn, location.state]);

    // 슬라이더 제어 로직 (기존과 동일)
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
            
            <div className="mypage-card">
                <div className="profile-info">
                    <div className="profile-icon">🌞</div>
                    <div>
                        <h2>{isLoggedIn ? (userNickname || userEmail) : '게스트'}</h2>
                        <p>{isLoggedIn ? '오늘도 좋은 하루 보내세요 ☀️' : '로그인 후 기록을 확인하세요'}</p>
                    </div>
                </div>
            </div>

            <div className="mypage-card history-section">
                <div className="history-header">
                    <h3>📊 분석 히스토리 ({historyData.length > 0 ? `${currentIndex}/${historyData.length}` : '0/0'})</h3>
                    <div className="slider-controls">
                        <button onClick={() => scrollSlider('left')} className="slider-arrow"><i className="fa-solid fa-chevron-left"></i></button>
                        <button onClick={() => scrollSlider('right')} className="slider-arrow"><i className="fa-solid fa-chevron-right"></i></button>
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
                                    <span className={`status-badge ${item.status === '적합' ? 'safe' : 'warn'}`}>{item.status}</span>
                                </div>
                            </div>
                            <div className="slide-card-body">
                                <div className="mini-ing-section key">
                                    <div className="mini-ing-title">핵심 성분</div>
                                    <div className="mini-ing-tags">
                                        {item.keyIng.map((ing, i) => <span key={i} className="mini-tag">{ing}</span>)}
                                    </div>
                                </div>
                                <div className="mini-ing-section warn">
                                    <div className="mini-ing-title">주의 성분</div>
                                    <div className="mini-ing-tags">
                                        {item.warnIng.length > 0 ? item.warnIng.map((ing, i) => <span key={i} className="mini-tag">{ing}</span>) : "없음"}
                                    </div>
                                </div>
                            </div>
                            <div className="slide-card-footer" onClick={() => navigate(`/history/${item.id}`, { state: { analysisData: item } })}>
                                상세 리포트 보기 <i className="fa-solid fa-arrow-right"></i>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyPage;