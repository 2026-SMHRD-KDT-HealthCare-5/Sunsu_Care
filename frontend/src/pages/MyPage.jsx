import { useNavigate } from 'react-router-dom';

const MyPage = () => {
  const navigate = useNavigate();
  
  // 가상의 히스토리 데이터
  const history = [
    { id: 1, date: '2024-03-20', product: 'A 선크림' },
    { id: 2, date: '2024-03-25', product: 'B 선크림' },
  ];

  return (
    <div>
      <h2>마이페이지</h2>
      
      <section style={{ border: '1px solid #eee', padding: '15px', marginBottom: '20px' }}>
        <h3>내 피부 프로필</h3>
        <p>타입: 건성 / 고민: 홍조</p>
        <button onClick={() => navigate('/survey')}>프로필 수정하기</button>
      </section>

      <section>
        <h3>내 분석 히스토리</h3>
        <ul>
          {history.map(item => (
            <li key={item.id} onClick={() => navigate('/analysis-result')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              {item.date} - {item.product} 분석 리포트
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: '30px' }}>
        <button>회원 정보 수정</button>
        <button style={{ color: 'red' }}>로그아웃</button>
      </section>
    </div>
  );
};

export default MyPage;