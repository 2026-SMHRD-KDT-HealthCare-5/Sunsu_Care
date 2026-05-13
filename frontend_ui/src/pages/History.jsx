import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/style.css';

const History = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={{ backgroundColor: '#f8fafc' }}>
      {/* 헤더 겹침 완벽 해결 */}
      <header style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #eee', width: '100%', zIndex: 10 }}>
        <i className="fa-solid fa-chevron-left" style={{ fontSize: '20px', cursor: 'pointer', color: '#111' }} onClick={() => navigate(-1)}></i>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>분석 히스토리</div>
        <div style={{ width: '20px' }}></div>
      </header>

      {/* 너비 100% 적용 */}
      <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px', fontWeight: '500' }}>
          총 <span style={{ color: '#2563eb', fontWeight: '700' }}>2건</span>의 분석 기록
        </div>

        <div onClick={() => navigate('/result')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#fff', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', cursor: 'pointer', border: '1px solid #e2e8f0', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>자작나무 수분 선크림</div>
            <div style={{ fontSize: '13px', color: '#475569' }}><span style={{ color: '#059669', fontWeight: '700', background: '#d1fae5', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', marginRight: '5px' }}>안전</span>피부 적합도 87%</div>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1' }}></i>
        </div>

        <div onClick={() => navigate('/result')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#fff', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', cursor: 'pointer', border: '1px solid #e2e8f0', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>B 브랜드 톤업 선크림</div>
            <div style={{ fontSize: '13px', color: '#475569' }}><span style={{ color: '#dc2626', fontWeight: '700', background: '#fee2e2', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', marginRight: '5px' }}>주의</span>알레르기 성분 1건</div>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1' }}></i>
        </div>
      </main>
    </div>
  );
};

export default History;