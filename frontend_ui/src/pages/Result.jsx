import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/style.css';

const Result = () => {
  const navigate = useNavigate();

  const ProgressBar = ({ label, score, percentage, color }) => (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', fontWeight: '700' }}>
        <span style={{ color: '#333' }}>{label}</span>
        <span style={{ color: color }}>({score})</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '10px' }}>
        <div style={{ width: percentage, height: '100%', background: color, borderRadius: '10px' }}></div>
      </div>
    </div>
  );

  const VerticalBar = ({ label, count, height }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 }}>
      <span style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>{count}</span>
      <div style={{ width: '20px', height: '60px', background: '#f1f5f9', borderRadius: '10px', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ width: '100%', height: height, background: '#00d282', borderRadius: '10px' }}></div>
      </div>
      <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', wordBreak: 'keep-all' }}>{label}</span>
    </div>
  );

  return (
    <div className="app-container" style={{ backgroundColor: '#fff' }}>
      <header style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #eee', padding: '20px 24px', display: 'flex', alignItems: 'center', zIndex: 10 }}>
        <i className="fa-solid fa-chevron-left" style={{ fontSize: '20px', cursor: 'pointer' }} onClick={() => navigate('/')}></i>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: '700' }}>AI 분석 결과</div>
        <div style={{ width: '20px' }}></div>
      </header>

      <main style={{ padding: '30px 24px 150px' }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>피부 적합도</div>
        <div style={{ fontSize: '60px', fontWeight: '900', color: '#00d282', lineHeight: '1', marginBottom: '15px' }}>87%</div>
        <div style={{ fontSize: '14px', color: '#64748b', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
          <span style={{ color: '#111', fontWeight: '700' }}>지성·민감성 피부에 적합</span> / 건성 피부에는 다소 건조할 수 있음
        </div>

        <div style={{ marginTop: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
          <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '20px', color: '#111' }}>상세 평가</div>
          <ProgressBar label="자외선 차단력" score="우수" percentage="90%" color="#2563eb" />
          <ProgressBar label="성분 안전성" score="양호" percentage="75%" color="#2563eb" />
          <ProgressBar label="피부 자극도" score="낮음" percentage="85%" color="#2563eb" />
          <ProgressBar label="사용감 (백탁/발림성)" score="보통" percentage="50%" color="#2563eb" />
        </div>

        <div style={{ marginTop: '30px', fontWeight: '700', fontSize: '18px', marginBottom: '15px', color: '#111' }}>핵심 성분 분석</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
          <span style={{ background: '#eff6ff', color: '#2563eb', padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>징크옥사이드 (저자극·무기자차)</span>
          <span style={{ background: '#eff6ff', color: '#2563eb', padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>무향료 (민감 피부 적합)</span>
        </div>
        <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '30px' }}>
          해당 제품은 <strong style={{color:'#111'}}>무기자차 기반</strong>으로 피부 자극이 적고 안정적인 자외선 차단 효과를 제공합니다. 특히 민감성 피부에서도 비교적 안전하게 사용할 수 있습니다.
        </p>

        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: '700', fontSize: '16px', color: '#111', marginBottom: '5px' }}>목적별 성분</div>
          <div style={{ fontSize: '13px', color: '#00d282', fontWeight: '700', marginBottom: '20px' }}>피부 보습, 피부 보호 등 도움을 주는 성분이 있어요</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px' }}>
            <VerticalBar label="피부 보습" count="19" height="100%" />
            <VerticalBar label="피부 보호" count="5" height="50%" />
            <VerticalBar label="자외선 차단" count="4" height="40%" />
            <VerticalBar label="수분 증발" count="2" height="20%" />
            <VerticalBar label="피부 미백" count="1" height="10%" />
          </div>
        </div>
      </main>

      <div style={{ position: 'fixed', bottom: 0, width: '100%', maxWidth: '420px', padding: '20px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 20 }}>
        <button style={{ width: '100%', padding: '16px', background: '#2563eb', color: '#fff', borderRadius: '12px', fontWeight: '700', fontSize: '15px' }} onClick={() => alert('세안 가이드 준비 중')}>맞춤 세안법 보기</button>
        <button style={{ width: '100%', padding: '16px', background: '#f1f5f9', color: '#475569', borderRadius: '12px', fontWeight: '700', fontSize: '15px' }} onClick={() => navigate('/')}>다른 제품 다시 분석하기</button>
      </div>
    </div>
  );
};

export default Result;