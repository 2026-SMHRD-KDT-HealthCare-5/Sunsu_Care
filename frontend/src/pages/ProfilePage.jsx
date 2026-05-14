import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});

  // 선택값 저장
  const handleSelect = (field, value) => {
    setAnswers({ ...answers, [field]: value });
  };

  // 다음 버튼 로직 (핵심 분기점)
  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } 
    else if (step === 2) {
      if (answers.basicType === '모름') {
        // '모름' 선택 시 5단계 AI 진단 시작
        setStep(3); 
      } else {
        // 아닐 경우 진단 건너뛰고 바로 8번 질문으로
        setStep(8); 
      }
    } 
    else if (step >= 3 && step < 7) {
      setStep(step + 1); // 진단 1~4단계 진행
    } 
    else if (step === 7) {
      // 🌟 진단 5단계 완료 시 알림창 띄우기 (기존 사진 10번 반영)
      alert('AI 분석 결과: "수분 부족형 지성(수부지) 및 민감성"으로 판정되었습니다!');
      setAnswers(prev => ({ ...prev, basicType: '수부지 및 민감성 (AI 진단)' }));
      setStep(8); // 공통 질문으로 합류
    } 
    else if (step >= 8 && step < 10) {
      setStep(step + 1); // 공통 질문 진행
    } 
    else if (step === 10) {
      // 🌟 설문 최종 완료 시 알림창 띄우기 (기존 사진 8번 반영)
      alert('설문이 완료되었습니다! 추천 결과 페이지로 이동합니다.');
      localStorage.setItem('userProfile', JSON.stringify(answers)); // 팀 규칙 반영
      navigate('/result'); 
    }
  };

  // 이전 버튼 로직
  const handlePrev = () => {
    if (step === 8) {
      // 8단계에서 뒤로 갈 때, AI 진단을 거쳐왔으면 7단계로, 아니면 2단계로
      if (answers.basicType && answers.basicType.includes('AI')) setStep(7);
      else setStep(2);
    } else {
      setStep(step - 1);
    }
  };

  return (
    <div className="page survey">
      <header className="survey-header">
        <div style={{ width: '24px' }}></div>
        <div className="logo">SunCare<span>.</span></div>
        <i className="fa-solid fa-xmark close-btn" onClick={() => navigate('/')}></i>
      </header>

      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${(step / 10) * 100}%` }}></div>
      </div>

      <main className="survey-main">
        {/* Step 1: 성별 (사람 아이콘 복구) */}
        {step === 1 && (
          <div>
            <h2 className="question-title">성별을 알려주세요.</h2>
            <div className="gender-wrap">
              <div onClick={() => handleSelect('gender', '남성')} className={`gender-card ${answers.gender === '남성' ? 'active-male' : ''}`}>
                <div className="gender-icon male"><i className="fa-solid fa-person"></i></div>
                <span style={{ fontWeight: '700', color: answers.gender === '남성' ? '#3b82f6' : '#333' }}>남성</span>
              </div>
              <div onClick={() => handleSelect('gender', '여성')} className={`gender-card ${answers.gender === '여성' ? 'active-female' : ''}`}>
                <div className="gender-icon female"><i className="fa-solid fa-person-dress"></i></div>
                <span style={{ fontWeight: '700', color: answers.gender === '여성' ? '#ec4899' : '#333' }}>여성</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 기본 피부 타입 */}
        {step === 2 && (
          <div>
            <h2 className="question-title">평소 느끼는 피부 타입은?</h2>
            <div className="option-list">
              {['건성 (세안 후 당김이 심해요)', '지성 (오후가 되면 번들거려요)', '복합성 (T존 지성, U존 건성)', '중성 (밸런스가 적당해요)', '민감성 (화장품이 자주 안 맞아요)'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('basicType', opt)} className={`option-btn ${answers.basicType === opt ? 'active' : ''}`}>{opt}</button>
              ))}
              <button onClick={() => handleSelect('basicType', '모름')} className={`option-btn unknown ${answers.basicType === '모름' ? 'active' : ''}`}>잘 모르겠음 (5단계 AI 정밀 진단)</button>
            </div>
          </div>
        )}

        {/* Step 3~7: 5단계 AI 정밀 진단 */}
        {step === 3 && (
          <div>
            <h2 className="question-title"><span className="question-subtitle">[진단 1/5]</span>세안 후 아무것도 안 발랐을 때<br/>피부 상태는?</h2>
            <div className="option-list">
              {['얼굴 전체가 심하게 당긴다', '이마/코는 괜찮은데 볼이 당긴다', '당김 없이 유분이 올라온다'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('diag1', opt)} className={`option-btn ${answers.diag1 === opt ? 'active' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="question-title"><span className="question-subtitle">[진단 2/5]</span>화장품을 바꿀 때 트러블이나<br/>붉어짐이 있나요?</h2>
            <div className="option-list">
              {['자주 그렇다 (매우 민감)', '가끔 컨디션에 따라 다르다', '아무거나 발라도 괜찮다'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('diag2', opt)} className={`option-btn ${answers.diag2 === opt ? 'active' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="question-title"><span className="question-subtitle">[진단 3/5]</span>오후가 되었을 때 T존(이마,코)의<br/>상태는 어떤가요?</h2>
            <div className="option-list">
              {['기름기가 거의 없이 건조하다', '적당히 윤기가 돈다', '기름기가 많아 번들거린다'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('diag3', opt)} className={`option-btn ${answers.diag3 === opt ? 'active' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 className="question-title"><span className="question-subtitle">[진단 4/5]</span>피부 두께와 붉은기 정도는<br/>어떠신가요?</h2>
            <div className="option-list">
              {['피부가 얇고 핏줄이 잘 보이며 붉어짐', '보통이다', '피부가 두껍고 붉은기가 거의 없다'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('diag4', opt)} className={`option-btn ${answers.diag4 === opt ? 'active' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <h2 className="question-title"><span className="question-subtitle">[진단 5/5]</span>환절기나 겨울철에 피부가<br/>어떻게 변하나요?</h2>
            <div className="option-list">
              {['각질이 일거나 크게 뒤집어진다', '조금 건조해지는 정도다', '계절 변화를 크게 느끼지 않는다'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('diag5', opt)} className={`option-btn ${answers.diag5 === opt ? 'active' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {/* Step 8~10: 공통 질문 */}
        {step === 8 && (
          <div>
            <h2 className="question-title">주로 활동하는 환경은?</h2>
            <div className="option-list">
              {['실내 (사무실/학교)', '야외 활동 (운동/현장)', '블루라이트 노출 많음'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('env', opt)} className={`option-btn ${answers.env === opt ? 'active' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 9 && (
          <div>
            <h2 className="question-title">선크림 사용 시<br/>가장 꺼려지는 점은?</h2>
            <div className="option-list">
              {['얼굴이 허옇게 뜨는 백탁', '바를 때 눈이 시림', '모공 막힘 및 트러블', '끈적이고 답답함'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('concern', opt)} className={`option-btn ${answers.concern === opt ? 'active' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === 10 && (
          <div>
            <h2 className="question-title">선호하는 선크림 제형이<br/>있나요?</h2>
            <div className="option-list">
              {['촉촉한 로션/에센스', '보송한 무기자차', '간편한 스틱/쿠션', '상관없음'].map((opt) => (
                <button key={opt} onClick={() => handleSelect('texture', opt)} className={`option-btn ${answers.texture === opt ? 'active' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="survey-footer">
        {step > 1 && <button className="nav-btn prev" onClick={handlePrev}>이전</button>}
        <button className="nav-btn next" onClick={handleNext}>
          {step === 7 ? '결과 확인' : step === 10 ? '완료하기' : '다음'}
        </button>
      </footer>
    </div>
  );
}

export default ProfilePage;