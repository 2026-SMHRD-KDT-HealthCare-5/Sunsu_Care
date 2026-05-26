import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProfile } from '../api/profileApi';
import { calculateSuitability } from '../utils/analyzeEngine'; 
import './HistoryDetailPage.css'; // 🌟 기획서 원본 디자인 유지

const HistoryDetailPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 

    // 🌟 1. 저장 팝업창 관리를 위한 State 추가
    const [showSaveModal, setShowSaveModal] = useState(false);
    
    // 임시 저장된 5개의 히스토리 리스트 (실제로는 백엔드에서 받아옵니다)
    const [mockSavedList, setMockSavedList] = useState([
        { id: 1, name: '메디힐 마데카소사이드 선세럼', date: '2026.05.14' },
        { id: 2, name: '마일드 선크림', date: '2026.05.14' },
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

    // 🌟 2. 저장하기 버튼 클릭 시 로직
    const handleSaveClick = () => {
        if (mockSavedList.length >= 5) {
            // 5개가 꽉 찼으면 모달창 띄우기
            setShowSaveModal(true);
        } else {
            // 공간이 있으면 바로 저장 후 이동
            alert("✨ 성공적으로 저장되었습니다!");
            navigate('/mypage');
        }
    };

    // 🌟 3. 모달창 안에서 기존 기록 '삭제 후 저장' 클릭 시 로직
    const handleDeleteAndSave = (targetId) => {
        if (window.confirm("선택한 기존 기록을 삭제하고 현재 분석 결과를 저장할까요?")) {
            setMockSavedList(mockSavedList.filter(item => item.id !== targetId));
            setShowSaveModal(false);
            alert("✨ 기존 기록이 교체되어 새롭게 저장되었습니다!");
            navigate('/mypage');
        }
    };

    if (isLoading || !analysisResult) {
        return <div style={{ padding: '40px', color: '#64748b', textAlign: 'center', marginTop: '50px' }}>🔍 정밀 리포트를 분석하고 있습니다...</div>;
    }

    return (
        <div className="legacy-detail-container fade-in-up">
            
            {/* 기존 예쁜 화면 영역 그대로 유지 (점수판, 성분 등) */}
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

            {/* ── 4. 수정된 하단 버튼 영역 (저장 버튼 및 안내 문구 추가) ── */}
            <div className="legacy-btn-group" style={{ marginBottom: '12px' }}>
                <button className="legacy-btn-outline" onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-arrow-left" style={{marginRight:'6px'}}></i> 뒤로
                </button>
                <button className="legacy-btn-solid" onClick={handleSaveClick}>
                    <i className="fa-solid fa-bookmark" style={{marginRight:'6px'}}></i> 저장하기
                </button>
            </div>
            
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>
                💡 분석 결과 히스토리는 최대 5개까지 저장 가능합니다.
            </div>

            {/* ── 5. 저장 공간 5개 초과 시 뜨는 예쁜 팝업 모달창 ── */}
            {showSaveModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px'
                }}>
                    <div className="fade-in-up" style={{
                        background: '#ffffff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-triangle-exclamation"></i> 저장 공간 초과 (5/5)
                            </h3>
                            <button onClick={() => setShowSaveModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#cbd5e1' }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '20px', lineHeight: '1.5' }}>
                            더 이상 새로운 결과를 저장할 수 없습니다.<br/>새로 저장하려면 <strong>기존 기록 중 1개를 삭제</strong>해주세요.
                        </p>
                        
                        {/* 기존 저장 리스트 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                            {mockSavedList.map(item => (
                                <div key={item.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', fontWeight:'500' }}>{item.date}</div>
                                    </div>
                                    <button onClick={() => handleDeleteAndSave(item.id)} style={{
                                        backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer'
                                    }}>
                                        삭제
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default HistoryDetailPage;