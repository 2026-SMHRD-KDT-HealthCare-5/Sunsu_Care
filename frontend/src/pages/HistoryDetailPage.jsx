import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HistoryDetailPage.css';

const HistoryDetailPage = () => {
    const navigate = useNavigate();

    
    const report = {
        productName: "솔",
        score: 82,
        status: "적합",
        keyIngredients: [
            { name: "나이아신아마이드", desc: "미백, 피부 장벽 강화" },
            { name: "히알루론산", desc: "깊은 보습" },
            { name: "산화아연", desc: "자외선 차단(무기자차)" }
        ],
        reason: "사용자의 건성·민감 피부에 자극을 줄 수 있는 옥시벤존이 포함되어 있어, 무기자차 기반의 다른 제품을 추천합니다.",
        warnIngredients: [
            { name: "옥시벤존", desc: "민감성 피부에 자극이 될 수 있음" },
            { name: "향료", desc: "알레르기 반응 가능성" }
        ]
    };

    return (
        <div className="detail-page-container">
            <div className="top-nav">
                <i className="fa-solid fa-xmark close-btn" onClick={() => navigate(-1)}></i>
            </div>

            {/* 1. 상단 점수판 (초록색 테두리) */}
            <div className="score-summary-box">
                <h2 className="prod-title">{report.productName}</h2>
                <div className="score-display">
                    <span className="score-big">{report.score}</span>
                    <span className="score-max">/ 100</span>
                </div>
                <div className="status-badge safe">{report.status}</div>
            </div>

            {/* 2. 핵심 성분 */}
            <div className="detail-card">
                <h3 className="detail-title"><span className="icon">💎</span> 핵심 성분</h3>
                {report.keyIngredients.map((ing, idx) => (
                    <div key={idx} className="ing-row key-ing">
                        <span className="ing-name">{ing.name}</span>
                        <span className="ing-desc">{ing.desc}</span>
                    </div>
                ))}
            </div>

            {/* 3. 추천 이유 */}
            <div className="detail-card">
                <h3 className="detail-title"><span className="icon">📝</span> 추천 이유</h3>
                <p className="reason-text">{report.reason}</p>
            </div>

            {/* 4. 주의 성분 */}
            <div className="detail-card">
                <h3 className="detail-title"><span className="icon">⚠️</span> 주의 성분</h3>
                {report.warnIngredients.map((ing, idx) => (
                    <div key={idx} className="ing-row warn-ing">
                        <span className="ing-name">{ing.name}</span>
                        <span className="ing-desc">{ing.desc}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryDetailPage; 