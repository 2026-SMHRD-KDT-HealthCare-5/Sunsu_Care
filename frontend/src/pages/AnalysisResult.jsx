import React from 'react';
import { useNavigate } from 'react-router-dom';

const AnalysisResult = () => {
  const navigate = useNavigate();

  // 리포트 저장 핸들러
  const handleSaveReport = () => {
    // 실제 구현 시에는 API를 호출하여 DB에 저장하는 로직이 들어갑니다.
    alert('해당 분석 결과가 [마이페이지]의 내 분석 히스토리에 영구 저장되었습니다.');
  };

  // 재분석 핸들러
  const handleReanalysis = () => {
    navigate('/analysis-input');
  };

  // 쇼핑 연동 (외부 구매 페이지)
  const handleShopping = (productUrl) => {
    window.open(productUrl, '_blank');
  };

  return (
    <div style={{ padding: '20px', lineHeight: '1.6' }}>
      <h2>분석 결과 상세 리포트</h2>
      
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h3>분석된 제품: [제품명 샘플]</h3>
        <p><strong>성분 안전도:</strong> 주의 성분 0개 (안전)</p>
        <p><strong>사용자 피부 적합도:</strong> 건성 피부에 매우 추천</p>
        <p><strong>총평:</strong> 이 제품은 민감한 피부에도 자극이 적은 성분들로 구성되어 있습니다.</p>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        <button onClick={handleSaveReport} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          리포트 저장
        </button>
        <button onClick={handleReanalysis} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          재분석 하기
        </button>
      </div>

      <hr style={{ margin: '40px 0' }} />

      <section>
        <h3>추천 제품 (쇼핑 연동)</h3>
        <div 
          onClick={() => handleShopping('https://example.com/item1')}
          style={{ border: '1px solid #eee', padding: '10px', cursor: 'pointer', marginBottom: '10px' }}
        >
          <p>🎁 [추천] 무기자차 저자극 선크림 - <strong>구매하러 가기</strong></p>
        </div>
        <div 
          onClick={() => handleShopping('https://example.com/item2')}
          style={{ border: '1px solid #eee', padding: '10px', cursor: 'pointer' }}
        >
          <p>🎁 [추천] 수분 가득 데일리 선 젤 - <strong>구매하러 가기</strong></p>
        </div>
      </section>
    </div>
  );
};

export default AnalysisResult;