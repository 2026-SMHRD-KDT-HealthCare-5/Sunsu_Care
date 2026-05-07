import { useNavigate } from 'react-router-dom';

const QuickAnalysis = () => {
  const navigate = useNavigate();

  const handleSaveResult = () => {
    const confirmLogin = window.confirm("데이터를 저장하려면 로그인이 필요합니다. 로그인하시겠습니까?");
    if (confirmLogin) navigate('/login', { state: { from: '/quick-analysis' } });
  };

  return (
    <div>
      <h2>간단 제품 분석 (체험형)</h2>
      <div style={{ border: '2px dashed #ccc', padding: '40px', textAlign: 'center' }}>
        [사진 업로드 / 스캔 영역]
      </div>
      
      <div className="result-area" style={{ marginTop: '20px' }}>
        <p>분석 결과: 이 제품은 민감성 피부에 적합합니다.</p>
        <button onClick={handleSaveResult}>결과 저장하기 (로그인 필요)</button>
        <button onClick={() => navigate('/survey')}>정밀 분석(피부 프로필 설정) 받기</button>
      </div>

      <button onClick={() => navigate('/')} style={{ marginTop: '20px' }}>메인으로 가기</button>
    </div>
  );
};

export default QuickAnalysis;