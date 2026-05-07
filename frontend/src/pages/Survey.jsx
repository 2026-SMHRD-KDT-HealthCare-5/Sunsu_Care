import { useNavigate } from 'react-router-dom';

const Survey = ({ isLoggedIn, tempData, setTempData }) => {
  const navigate = useNavigate();

  const handleComplete = () => {
    if (isLoggedIn) {
      // API 저장 로직 수행 후 이동
      navigate('/analysis-input');
    } else {
      alert("로그인이 필요한 서비스입니다. 작성하신 데이터는 유지됩니다.");
      navigate('/login', { state: { from: '/survey' } });
    }
  };

  return (
    <div>
      <h2>피부 프로필 설정</h2>
      <input 
        type="text" 
        placeholder="피부 타입을 입력하세요" 
        value={tempData || ""} 
        onChange={(e) => setTempData(e.target.value)} 
      />
      <button onClick={handleComplete}>설문 완료</button>
    </div>
  );
};

export default Survey;