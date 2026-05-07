import { useNavigate } from 'react-router-dom';

const Main = () => {
  const navigate = useNavigate();

  return (
    <div className="main-container">
      <h1>SUNSU_CARE</h1>
      
      <section style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/survey')}>내 피부에 딱! 추천 받기</button>
        <button onClick={() => navigate('/quick-analysis')}>기존 제품 성분 분석하기</button>
      </section>

      <section className="info-section">
        <h3>성분 정보 가이드</h3>
        <div onClick={() => alert('상세 페이지 이동')}>[글/영상] 선크림 성분 제대로 읽는 법</div>
      </section>

      <section className="shopping-section">
        <h3>추천 쇼핑템</h3>
        <div onClick={() => window.open('https://example.com/shop', '_blank')}>
          [구매 연동] 무기자차 선크림 특가 보기
        </div>
      </section>
    </div>
  );
};

export default Main;