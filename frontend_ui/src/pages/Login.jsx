import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/style.css';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={{ backgroundColor: '#f8fafc' }}>
      {/* 🌟 새로 만든 세련된 헤더 적용 */}
      <header className="app-header" style={{ background: '#f8fafc', borderBottom: 'none' }}>
        <div style={{ width: '22px' }}></div>
        <div className="header-title">SUN-SCAN<span>.</span></div>
        <i className="fa-solid fa-xmark" onClick={() => navigate('/')}></i>
      </header>

      <main className="app-main" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ background: '#fff', padding: '40px 24px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '30px', color: '#111' }}>로그인</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <input type="text" placeholder="아이디 (예: smart)" style={{ width: '100%', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px' }} />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <input type="password" placeholder="비밀번호를 입력하세요" style={{ width: '100%', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px' }} />
          </div>

          <button style={{ width: '100%', background: '#2563eb', color: '#fff', padding: '18px', borderRadius: '12px', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer', marginBottom: '10px' }} onClick={() => navigate('/')}>
            로그인
          </button>
          
          <button style={{ width: '100%', background: '#f1f5f9', color: '#475569', padding: '18px', borderRadius: '12px', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer', marginBottom: '20px' }} onClick={() => navigate('/signup')}>
            회원가입
          </button>

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }} onClick={() => navigate('/')}>메인으로 돌아가기</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button style={{ width: '100%', background: '#FEE500', color: '#111', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>카카오로 시작하기</button>
            <button style={{ width: '100%', background: '#03C75A', color: '#fff', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>네이버로 시작하기</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;