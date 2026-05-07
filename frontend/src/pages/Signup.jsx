import { useNavigate } from 'react-router-dom';

const Signup = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleSignup = () => {
    // 가입 로직 처리 후
    setIsLoggedIn(true);
    alert("가입이 완료되었습니다!");
    navigate('/survey'); // 가입 후 설문 페이지로 유도
  };

  return (
    <div>
      <h2>회원가입</h2>
      <input type="text" placeholder="아이디" /><br/>
      <input type="password" placeholder="비밀번호" /><br/>
      <button onClick={handleSignup}>회원가입 완료</button>
    </div>
  );
};

export default Signup;