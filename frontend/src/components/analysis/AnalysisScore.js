// frontend/src/components/AnalysisScore.js
import React from 'react';
import './AnalysisScore.css'; // 간단한 스타일링 필요

const AnalysisScore = ({ score, status, prod_name }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'RECOMMENDED': return '#27ae60'; // 초록
      case 'CAUTION': return '#f1c40f'; // 노랑
      case 'NOT_RECOMMENDED': return '#e74c3c'; // 빨강
      default: return '#7f8c8d';
    }
  };

  return (
    <div className="analysis-score-card">
      <h2>{prod_name}</h2>
      <div className="score-circle" style={{ borderColor: getStatusColor(status) }}>
        <span className="score-value">{score}</span>
        <span className="score-label">점</span>
      </div>
      <p className="status-text" style={{ color: getStatusColor(status) }}>
        {status === 'RECOMMENDED' ? '피부에 적합해요!' : 
         status === 'CAUTION' ? '주의가 필요해요!' : '사용을 권장하지 않아요!'}
      </p>
    </div>
  );
};

export default AnalysisScore;