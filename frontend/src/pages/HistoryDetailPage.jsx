import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HistoryDetailPage.css';

const HistoryDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 💡 마이페이지에서 전달받은 데이터를 사용, 없으면 기본값(폴백) 적용
    const report = location.state?.analysisData || {
        productName: "분석된 제품",
        score: 0,
        status: "알 수 없음",
        keyIngredients: [],
        reason: "분석 데이터를 불러올 수 없습니다.",
        warnIngredients: []
    };

    return (
        <div className="legacy-detail-container fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '10px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {/* 1. 최상단 점수판 */}
            <div className="legacy-detail-score-card">
                <h2 className="legacy-detail-title">{report.productName}</h2>
                <div className="legacy-detail-score">
                    {report.score}<span> / 100</span>
                </div>
                <span className={`legacy-status-badge ${report.status === '적합' || report.status === '최적' ? 'safe' : 'warn'}`}>
                    {report.status}
                </span>
            </div>

            {/* 2 & 3. 핵심 성분 & 추천 이유 */}
            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-heart" style={{color:'#3b82f6'}}></i> 핵심 성분
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {report.keyIngredients.map((ing, idx) => (
                        <div className="legacy-key-row" key={idx}>
                            <span className="legacy-key-name">{ing.name}</span>
                            <span className="legacy-key-desc">{ing.desc || "주요 성분"}</span>
                        </div>
                    ))}
                </div>

                <div className="legacy-divider"></div>

                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-book-open" style={{color:'#ef4444'}}></i> 추천 이유
                </h4>
                <p className="legacy-reason-text">{report.reason}</p>
            </div>

            {/* 4. 주의 성분 */}
            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-triangle-exclamation" style={{color:'#ea580c'}}></i> 주의 성분
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* 💡 디버깅용: report.warnIngredients가 실제로 존재하는지 확인 */}
                    {console.log("DEBUG: 주의 성분 데이터 확인 ->", report.warnIngredients)}
                    
                    {Array.isArray(report.warnIngredients) && report.warnIngredients.length > 0 ? (
                        report.warnIngredients.map((ing, idx) => (
                            <div className="legacy-warn-row" key={idx}>
                                <span className="legacy-warn-name">{ing.name || "알 수 없음"}</span>
                                <span className="legacy-warn-desc">{ing.desc || "주의 필요"}</span>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>주의가 필요한 성분이 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 5. 추천 제품 리스트 (상단 카드 형태 유지) */}
            <div className="legacy-detail-card">
                <h4 className="legacy-sec-title">
                    <i className="fa-solid fa-wand-magic-sparkles" style={{color:'#ff8c00'}}></i> 추천 제품
                </h4>
                {/* 기존 추천 제품 UI 유지 */}
                <div className="legacy-recom-card">
                    <span className="legacy-recom-brand">SunSafe</span>
                    <h5 className="legacy-recom-name">마일드 미네랄 선크림</h5>
                    <div className="legacy-recom-tags">
                        <span className="legacy-recom-tag">SPF50+</span>
                        <span className="legacy-recom-tag">PA++++</span>
                        <span className="legacy-recom-tag solid">무기자차</span>
                    </div>
                </div>
            </div>

            {/* 6. 하단 버튼 영역 */}
            <div className="legacy-btn-group">
                <button className="legacy-btn-outline" onClick={() => navigate('/scan')}>
                    <i className="fa-solid fa-rotate" style={{color:'#3b82f6', marginRight:'6px'}}></i> 재분석
                </button>
                <button className="legacy-btn-solid" onClick={() => navigate('/guide')}>
                    <i className="fa-solid fa-book" style={{marginRight:'6px'}}></i> 세안 가이드
                </button>
            </div>
        </div>
    );
};

export default HistoryDetailPage;