import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProfile } from '../api/profileApi';
import { calculateSuitability } from '../utils/analyzeEngine'; 
import './HistoryDetailPage.css';

const HistoryDetailPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 

    // 🌟 1. 예쁜 커스텀 알림창(모달) 상태 관리
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'alert',
        message: '',
        onConfirm: null 
    });

    const [mockSavedList, setMockSavedList] = useState([
        { id: 1, name: '메디힐 마데카소사이드 선세럼', date: '2026.05.14' },
        { id: 2, name: '솔', date: '2026.05.14' },
        { id: 3, name: '톤업 선밀크', date: '2026.05.13' },
        { id: 4, name: '닥터지 그린 마일드 업 선', date: '2026.05.12' },
        { id: 5, name: '이니스프리 수분 선크림', date: '2026.05.11' }
    ]);

    const historyDatabase = {
        "1": { name: '메디힐 마데카소사이드 선세럼', date: '2026.05.14', ingredients: ['정제수', '나이아신아마이드', '히알루론산', '산화아연', '옥시벤존', '향료'] },
        "2": { name: '솔', date: '2026.05.14', ingredients: ['나이아신아마이드', '히알루론산', '산화아연', '옥시벤존', '향료'] },
        "3": { name: '톤업 선밀크', date: '2026.05.13', ingredients: ['징크옥사이드', '에탄올', '페녹시에탄올'] },
        "4": { name: '닥터지 그린 마일드 업 선', date: '2026.05.12', ingredients: ['정제수', '징크옥사이드', '히알루론산', '판테놀'] },
        "5": { name: '이니스프리 수분 선크림', date: '2026.05.11', ingredients: ['정제수', '세라마이드', '에탄올', '향료'] }
    };

    const keyDescMap = {
        '나이아신아마이드': '미백, 피부 장벽 강화',
        '히알루론산': '깊은 보습',
        '산화아연': '자외선 차단(무기자차)',
        '징크옥사이드': '자외선 차단(무기자차)',
        '판테놀': '피부 진정 및 보습'
    };
    
    const warnDescMap = {
        '옥시벤존': '민감성 피부에 자극이 될 수 있음',
        '향료': '알레르기 반응 가능성',
        '에탄올': '수분 증발로 인한 건조함 유발'
    };

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            try {
                let profileToUse = { basicType: "미설정", concern: "미설정" };
                try {
                    const profileData = await fetchProfile();
                    if (profileData) {
                        profileToUse = {
                            basicType: profileData.skin_type || "미설정",
                            concern: Array.isArray(profileData.avoid_ingredient) 
                                    ? profileData.avoid_ingredient.join(', ') 
                                    : (profileData.avoid_ingredient || "미설정")
                        };
                    }
                } catch (apiErr) {
                    console.warn("API 연동 지연, 기본 프로필 진행");
                }

                if (isMounted) {
                    setUserProfile(profileToUse);
                    setProduct(historyDatabase[id] || historyDatabase["1"]);
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted) setIsLoading(false);
            }
        };
        
        loadData();
        return () => { isMounted = false; };
    }, [id]);

    const analysisResult = React.useMemo(() => {
        if (!userProfile || !product) return null;
        return calculateSuitability(userProfile, product);
    }, [userProfile, product]);

    const currentIndex = mockSavedList.findIndex(item => Number(item.id) === Number(id));
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < mockSavedList.length - 1;

    const goPrev = () => {
        if (hasPrev) navigate(`/history/${mockSavedList[currentIndex - 1].id}`);
    };
    const goNext = () => {
        if (hasNext) navigate(`/history/${mockSavedList[currentIndex + 1].id}`);
    };

    const handleSaveClick = () => {
        if (mockSavedList.length >= 5) {
            setModal({
                isOpen: true,
                type: 'alert',
                message: '저장은 5개까지 가능합니다.\n새로 저장하려면 기존 기록을 삭제해 주세요.',
                onConfirm: null 
            });
        } else {
            setModal({
                isOpen: true,
                type: 'alert',
                message: '✨ 성공적으로 저장되었습니다!',
                onConfirm: null 
            });
        }
    };

    // 🌟 3. 화살표 고장을 방지하도록 순서를 수정한 삭제 로직
    const handleDeleteClick = () => {
        setModal({
            isOpen: true,
            type: 'confirm',
            message: '정말로 이 분석 결과를 삭제하시겠습니까?',
            onConfirm: () => {
                setModal({
                    isOpen: true,
                    type: 'alert',
                    message: '🗑️ 삭제되었습니다!',
                    onConfirm: () => {
                        // 💡 "삭제되었습니다" 창에서 '확인'을 누를 때 데이터를 지우고 바로 이동!
                        const updatedList = mockSavedList.filter(item => Number(item.id) !== Number(id));
                        setMockSavedList(updatedList);
                        setModal(prev => ({ ...prev, isOpen: false })); 
                        
                        if (updatedList.length > 0) {
                            navigate(`/history/${updatedList[0].id}`);
                        } else {
                            navigate('/mypage'); 
                        }
                    }
                });
            }
        });
    };

    const handleModalConfirm = () => {
        if (modal.onConfirm) {
            modal.onConfirm();
        } else {
            setModal(prev => ({ ...prev, isOpen: false })); 
        }
    };

    if (isLoading || !analysisResult) {
        return <div style={{ padding: '40px', color: '#64748b', textAlign: 'center', marginTop: '50px' }}>🔍 정밀 리포트를 분석하고 있습니다...</div>;
    }

    return (
        <div className="legacy-detail-container fade-in-up">  
            
            <h1 style={{ margin: '0 0 20px 7px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ color: '#1C1E22' }}></i>
                분석 히스토리 ({currentIndex >= 0 ? currentIndex + 1 : 1}/{mockSavedList.length})
            </h1>

            <div className="history-nav-arrows">
                <button 
                    className="history-nav-btn" 
                    onClick={goPrev} 
                    disabled={!hasPrev}
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button 
                    className="history-nav-btn" 
                    onClick={goNext} 
                    disabled={!hasNext}
                >
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>
            
            <div className="legacy-detail-score-card">
                <h2 className="legacy-detail-title">{product.name}</h2>
                <div className="legacy-detail-score">
                    {analysisResult.score}<span> / 100</span>
                </div>
                <span className={`legacy-status-badge ${analysisResult.status === '주의' || analysisResult.status === '부적합' ? 'warn' : 'safe'}`}>
                    {analysisResult.status}
                </span>
            </div>

            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-heart" style={{color:'#3b82f6'}}></i> 핵심 성분
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {analysisResult.keyIngredients.length > 0 ? (
                        analysisResult.keyIngredients.map((ing, idx) => (
                            <div className="legacy-key-row" key={idx}>
                                <span className="legacy-key-name">{ing}</span>
                                <span className="legacy-key-desc">{keyDescMap[ing] || '유효 성분'}</span>
                            </div>
                        ))
                    ) : (
                        <div className="legacy-key-row"><span className="legacy-key-desc">매칭된 성분이 없습니다.</span></div>
                    )}
                </div>

                <div className="legacy-divider"></div>

                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-book-open" style={{color:'#ef4444'}}></i> 추천 이유
                </h4>
                <p className="legacy-reason-text">
                    사용자의 {userProfile.basicType} 피부에 자극을 줄 수 있는 {analysisResult.warnIngredients[0] || '유해 성분'}이(가) 포함되어 있어, 무기자차 기반의 다른 제품을 추천합니다.
                </p>
            </div>

            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-triangle-exclamation" style={{color:'#ea580c'}}></i> 주의 성분
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {analysisResult.warnIngredients.length > 0 ? (
                        analysisResult.warnIngredients.map((ing, idx) => (
                            <div className="legacy-warn-row" key={idx}>
                                <span className="legacy-warn-name">{ing}</span>
                                <span className="legacy-warn-desc">{warnDescMap[ing] || '주의가 필요한 성분입니다.'}</span>
                            </div>
                        ))
                    ) : (
                        <p className="legacy-reason-text">발견된 주의 성분이 없습니다.</p>
                    )}
                </div>
            </div>

            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-wand-magic-sparkles" style={{color:'#ff8c00'}}></i> 추천 제품
                </h4>
                
                <div className="legacy-recom-card">
                    <span className="legacy-recom-brand">SunSafe</span>
                    <h5 className="legacy-recom-name">마일드 미네랄 선크림</h5>
                    <div className="legacy-recom-tags">
                        <span className="legacy-recom-tag">SPF50+</span>
                        <span className="legacy-recom-tag">PA++++</span>
                        <span className="legacy-recom-tag solid">무기자차</span>
                    </div>
                    <div className="legacy-recom-desc">
                        <i className="fa-regular fa-lightbulb" style={{color:'#f59e0b', marginTop:'2px'}}></i>
                        <span>건성·민감 피부에 자극이 적은 무기자차 성분 위주.</span>
                    </div>
                </div>

                <div className="legacy-recom-card">
                    <span className="legacy-recom-brand">CalmDerm</span>
                    <h5 className="legacy-recom-name">시카 진정 선밤</h5>
                    <div className="legacy-recom-tags">
                        <span className="legacy-recom-tag">SPF50+</span>
                        <span className="legacy-recom-tag">PA+++</span>
                        <span className="legacy-recom-tag solid">무기자차</span>
                    </div>
                    <div className="legacy-recom-desc">
                        <i className="fa-regular fa-lightbulb" style={{color:'#f59e0b', marginTop:'2px'}}></i>
                        <span>센텔라 성분으로 진정 효과 추가.</span>
                    </div>
                </div>
            </div>

            <div className="legacy-btn-group" style={{ marginBottom: '12px' }}>
                <button className="legacy-btn-outline" onClick={handleDeleteClick}>
                    <i className="fa-solid fa-trash" style={{marginRight:'6px'}}></i> 삭제하기
                </button>
                <button className="legacy-btn-solid" onClick={handleSaveClick}>
                    <i className="fa-solid fa-bookmark" style={{marginRight:'6px'}}></i> 저장하기
                </button>
            </div>
            
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>
                💡 분석 결과 히스토리는 최대 5개까지 저장 가능합니다.
            </div>

            {/* 🌟 5. 커스텀 팝업 (모달) */}
            {modal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px'
                }}>
                    <div className="fade-in-up" style={{
                        background: '#ffffff', borderRadius: '16px', padding: '28px 24px', width: '100%', maxWidth: '320px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <p style={{ fontSize: '1.05rem', color: '#1e293b', margin: '0 0 24px 0', lineHeight: '1.5', whiteSpace: 'pre-wrap', fontWeight: '600' }}>
                            {modal.message}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            {modal.type === 'confirm' && (
                                <button 
                                    onClick={() => setModal(prev => ({ ...prev, isOpen: false }))} 
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#64748b', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
                                >
                                    취소
                                </button>
                            )}
                            <button 
                                onClick={handleModalConfirm} 
                                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ff8c00', color: '#ffffff', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default HistoryDetailPage;