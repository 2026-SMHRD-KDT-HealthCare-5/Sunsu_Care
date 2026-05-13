import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/style.css';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={{ backgroundColor: '#f8fafc' }}>
      {/* 헤더 고정 및 겹침 방지 스타일 적용 */}
      <header style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #eee', width: '100%', zIndex: 10 }}>
        <i className="fa-solid fa-chevron-left" style={{ fontSize: '20px', cursor: 'pointer', color: '#111' }} onClick={() => navigate(-1)}></i>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>나의 피부 정보</div>
        <div style={{ width: '20px' }}></div>
      </header>

      {/* 너비 100% (꽉 차게) 적용 */}
      <main style={{ padding: '30px 24px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '30px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', textAlign: 'center', width: '100%' }}>
          <i className="fa-solid fa-circle-user" style={{ fontSize: '50px', color: '#2563eb', marginBottom: '15px' }}></i>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '5px' }}>홍길동 님</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '25px' }}>smart@naver.com</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '10px', fontSize: '14px' }}>
              <strong style={{ color: '#1e293b' }}>피부 타입</strong> <span style={{ color: '#2563eb', fontWeight: '700' }}>복합성</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '10px', fontSize: '14px' }}>
              <strong style={{ color: '#1e293b' }}>민감도</strong> <span style={{ color: '#2563eb', fontWeight: '700' }}>매우 민감함</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0', fontSize: '14px' }}>
              <strong style={{ color: '#1e293b' }}>기피 성분</strong> <span style={{ color: '#2563eb', fontWeight: '700' }}>에탄올, 인공향료</span>
            </div>
          </div>

          <button style={{ width: '100%', padding: '16px', background: '#2563eb', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginTop: '20px' }} 
                  onClick={() => navigate('/survey')}>
            피부 프로필 수정하기
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;