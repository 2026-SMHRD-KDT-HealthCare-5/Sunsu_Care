import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/style.css';

const Survey = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});

  const handleSelect = (field, value) => {
    setAnswers({ ...answers, [field]: value });
  };

  const handleNext = () => {
    if (step === 2 && answers.basicType === '모름') setStep(3);
    else if (step === 2 && answers.basicType !== '모름') setStep(5);
    else if (step === 7) navigate('/result');
    else setStep(step + 1);
  };

  return (
    <div className="app-container" style={{ backgroundColor: '#fff' }}>
      
      <header className="app-header">
        <div style={{ width: '24px' }}></div>
        <div className="header-title">SUN-SCAN<span>.</span></div>
        <i className="fa-solid fa-xmark" onClick={() => navigate('/')}></i>
      </header>

      <div className="progress-bg">
        <div className="progress-fill" style={{ width: `${(step / 7) * 100}%` }}></div>
      </div>

      <main className="app-main" style={{ padding: '40px 24px' }}>
        {step === 1 && (
          <div style={{textAlign:'center'}}>
            <h2 style={{fontSize:'22px', fontWeight:'700', marginBottom:'30px', color:'#111'}}>성별을 알려주세요.</h2>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <div onClick={() => handleSelect('gender', '남성')} style={{ flex: 1, padding: '40px 0', borderRadius: '20px', border: answers.gender === '남성' ? '2px solid #2563eb' : '1px solid #e2e8f0', background: answers.gender === '남성' ? '#eff6ff' : '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '30px' }}><i className="fa-solid fa-person"></i></div>
                <span style={{ fontWeight: '700', fontSize: '16px', color: answers.gender === '남성' ? '#2563eb' : '#333' }}>남성</span>
              </div>
              <div onClick={() => handleSelect('gender', '여성')} style={{ flex: 1, padding: '40px 0', borderRadius: '20px', border: answers.gender === '여성' ? '2px solid #ec4899' : '1px solid #e2e8f0', background: answers.gender === '여성' ? '#fdf2f8' : '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f472b6', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '30px' }}><i className="fa-solid fa-person-dress"></i></div>
                <span style={{ fontWeight: '700', fontSize: '16px', color: answers.gender === '여성' ? '#ec4899' : '#333' }}>여성</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '20px', color:'#111' }}>평소 느끼는 피부 타입은?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['건성 (세안 후 당김이 심해요)', '지성 (오후가 되면 번들거려요)', '복합성 (T존 지성, U존 건성)', '중성 (유수분 밸런스가 적당해요)', '민감성 (화장품이 자주 안 맞아요)'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('basicType', opt)} style={{ width: '100%', padding: '18px', borderRadius: '12px', textAlign: 'left', fontSize: '15px', cursor: 'pointer', border: answers.basicType === opt ? '2px solid #2563eb' : '1px solid #e2e8f0', background: answers.basicType === opt ? '#eff6ff' : '#fff', color: answers.basicType === opt ? '#2563eb' : '#333', fontWeight: answers.basicType === opt ? '700' : '500' }}>{opt}</button>
              ))}
              <button onClick={() => handleSelect('basicType', '모름')} style={{ width: '100%', padding: '18px', borderRadius: '12px', border: '1px dashed #94a3b8', background: answers.basicType === '모름' ? '#f1f5f9' : '#fff', color: '#64748b', fontWeight: '700', fontSize: '15px', cursor: 'pointer', textAlign: 'center', marginTop: '10px' }}>잘 모르겠음 (AI 진단)</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', textAlign: 'center', marginBottom: '20px', lineHeight: '1.4', color:'#111' }}>[진단 1/5]<br/>세안 후 아무것도 바르지<br/>않았을 때 피부 상태는?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['얼굴 전체가 심하게 당긴다', '이마/코는 괜찮은데 볼이 당긴다', '당김 없이 유분이 올라온다'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('detail1', opt)} style={{ width: '100%', padding: '18px', borderRadius: '12px', textAlign: 'left', fontSize: '15px', cursor: 'pointer', border: answers.detail1 === opt ? '2px solid #2563eb' : '1px solid #e2e8f0', background: answers.detail1 === opt ? '#eff6ff' : '#fff', color: answers.detail1 === opt ? '#2563eb' : '#333', fontWeight: answers.detail1 === opt ? '700' : '500' }}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', textAlign: 'center', marginBottom: '20px', lineHeight: '1.4', color:'#111' }}>[진단 2/5]<br/>화장품을 바꿀 때 트러블이나<br/>붉어짐이 있나요?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['자주 그렇다 (매우 민감)', '가끔 컨디션에 따라 다르다', '아무거나 발라도 괜찮다'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('detail2', opt)} style={{ width: '100%', padding: '18px', borderRadius: '12px', textAlign: 'left', fontSize: '15px', cursor: 'pointer', border: answers.detail2 === opt ? '2px solid #2563eb' : '1px solid #e2e8f0', background: answers.detail2 === opt ? '#eff6ff' : '#fff', color: answers.detail2 === opt ? '#2563eb' : '#333', fontWeight: answers.detail2 === opt ? '700' : '500' }}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '20px', color:'#111' }}>주로 활동하는 환경은?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['실내 (사무실/학교)', '야외 활동 (운동/현장)', '블루라이트 노출 많음'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('environment', opt)} style={{ width: '100%', padding: '18px', borderRadius: '12px', textAlign: 'left', fontSize: '15px', cursor: 'pointer', border: answers.environment === opt ? '2px solid #2563eb' : '1px solid #e2e8f0', background: answers.environment === opt ? '#eff6ff' : '#fff', color: answers.environment === opt ? '#2563eb' : '#333', fontWeight: answers.environment === opt ? '700' : '500' }}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '20px', color:'#111', lineHeight:'1.4' }}>선크림 사용 시<br/>가장 꺼려지는 점은?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['얼굴이 허옇게 뜨는 백탁', '바를 때 눈이 시림', '모공 막힘 및 트러블', '끈적이고 답답함'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('concern', opt)} style={{ width: '100%', padding: '18px', borderRadius: '12px', textAlign: 'left', fontSize: '15px', cursor: 'pointer', border: answers.concern === opt ? '2px solid #2563eb' : '1px solid #e2e8f0', background: answers.concern === opt ? '#eff6ff' : '#fff', color: answers.concern === opt ? '#2563eb' : '#333', fontWeight: answers.concern === opt ? '700' : '500' }}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '20px', color:'#111', lineHeight:'1.4' }}>선호하는 선크림 제형이<br/>있나요?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['촉촉한 로션/에센스', '보송한 무기자차', '간편한 스틱/쿠션', '상관없음'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('texture', opt)} style={{ width: '100%', padding: '18px', borderRadius: '12px', textAlign: 'left', fontSize: '15px', cursor: 'pointer', border: answers.texture === opt ? '2px solid #2563eb' : '1px solid #e2e8f0', background: answers.texture === opt ? '#eff6ff' : '#fff', color: answers.texture === opt ? '#2563eb' : '#333', fontWeight: answers.texture === opt ? '700' : '500' }}>{opt}</button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer style={{ flex: '0 0 85px', padding: '15px 24px', borderTop: '1px solid #eee', background: '#fff', display: 'flex', gap: '10px' }}>
        {step > 1 && <button onClick={() => setStep(step === 5 && answers.basicType !== '모름' ? 2 : step - 1)} style={{ flex: 1, height: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '30px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', color: '#475569' }}>이전</button>}
        <button onClick={handleNext} style={{ flex: 2, height: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>{step === 7 ? '결과 확인' : '다음'}</button>
      </footer>

    </div>
  );
};

export default Survey;