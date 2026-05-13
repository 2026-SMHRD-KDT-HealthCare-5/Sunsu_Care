import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/style.css';

const Signup = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={{ backgroundColor: '#f4f5f7' }}>
      <header style={{ position: 'sticky', top: 0, background: '#f4f5f7', padding: '20px 24px', display: 'flex', alignItems: 'center', zIndex: 10 }}>
        <i className="fa-solid fa-chevron-left" style={{ fontSize: '20px', cursor: 'pointer', color: '#111' }} onClick={() => navigate(-1)}></i>
      </header>

      <main style={{ padding: '10px 24px 40px', width: '100%', overflowY: 'auto' }}>
        <div style={{ background: '#fff', padding: '30px 20px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '30px', color: '#111' }}>회원가입</h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>아이디</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <input type="text" placeholder="아이디 입력" style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', minWidth: '0' }} />
              <button style={{ padding: '0 15px', background: '#334155', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>중복 확인</button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>비밀번호</label>
            <input type="password" placeholder="비밀번호 입력" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>비밀번호 확인</label>
            <input type="password" placeholder="비밀번호 재입력" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>이름</label>
            <input type="text" placeholder="이름 (예: 홍길동)" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>이메일</label>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'nowrap' }}>
              <input type="text" placeholder="이메일 아이디" style={{ flex: 1.2, padding: '15px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', minWidth: '0', fontSize: '13px' }} />
              <span style={{ color: '#64748b' }}>@</span>
              <select style={{ flex: 1, padding: '15px 5px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '13px', minWidth: '0' }}>
                <option>naver.com</option>
                <option>gmail.com</option>
                <option>daum.net</option>
              </select>
            </div>
          </div>

          <button style={{ width: '100%', padding: '18px', background: '#2563eb', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: '700', fontSize: '16px', cursor: 'pointer', marginBottom: '10px' }} onClick={() => { alert('가입을 환영합니다!'); navigate('/login'); }}>
            회원가입 완료
          </button>
          <button style={{ width: '100%', padding: '18px', background: '#e2e8f0', color: '#475569', borderRadius: '12px', border: 'none', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            메인으로
          </button>
        </div>
      </main>
    </div>
  );
};

export default Signup;