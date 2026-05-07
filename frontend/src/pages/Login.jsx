import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 이전 페이지 정보가 있으면 그곳으로, 없으면 메인('/')으로
  const from = location.state?.from || "/";

  const handleLogin = () => {
    setIsLoggedIn(true);
    alert("로그인되었습니다!");
    navigate(from, { replace: true });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>로그인 페이지</h2>
      <div style={{ marginBottom: '10px' }}>
        <input type="text" placeholder="아이디" style={{ display: 'block', marginBottom: '5px' }} />
        <input type="password" placeholder="비밀번호" style={{ display: 'block' }} />
      </div>
      <button onClick={handleLogin}>로그인 완료</button>
      <button onClick={() => navigate('/signup')} style={{ marginLeft: '10px' }}>회원가입</button>
    </div>
  );
};

// 이 줄이 반드시 있어야 합니다!
export default Login;