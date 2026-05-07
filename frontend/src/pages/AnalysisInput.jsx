import { useNavigate } from 'react-router-dom';

const AnalysisInput = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>정밀 분석용 제품 촬영</h2>
      <button style={{ width: '100px', height: '100px' }}>[사진 촬영]</button>
      <button style={{ width: '100px', height: '100px' }}>[업로드]</button>
      <br/>
      <button onClick={() => navigate('/analysis-result')} style={{ marginTop: '20px' }}>분석 시작</button>
    </div>
  );
};

export default AnalysisInput;