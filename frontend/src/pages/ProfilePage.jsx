import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const STEPS = { GENDER: 1, BASIC_TYPE: 2, AI_START: 3, AI_END: 7, AI_BRIDGE: 8, COMMON_START: 9, CONCERN: 10, FINAL: 11 };
const STEP_FIELDS = { 1: 'gender', 2: 'basicType', 3: 'diag1', 4: 'diag2', 5: 'diag3', 6: 'diag4', 7: 'diag5', 9: 'env', 10: 'concern', 11: 'texture' };

const CONSTANTS = {
  GENDER_OPTIONS: ['남성', '여성'],
  BASIC_TYPE_OPTIONS: ['건성 (세안 후 당김이 심해요)', '지성 (오후가 되면 번들거려요)', '복합성 (T존 지성, U존 건성)', '중성 (밸런스가 적당해요)', '민감성 (화장품이 자주 안 맞아요)'],
  ENV_OPTIONS: ['실내 (사무실/학교)', '야외 활동 (운동/현장)', '블루라이트 노출 많음'],
  CONCERN_OPTIONS: ['얼굴이 허옇게 뜨는 백탁', '바를 때 눈이 시림', '모공 막힘 및 트러블', '끈적이고 답답함'],
  TEXTURE_OPTIONS: [
    { id: '촉촉한 로션/에센스', label: '촉촉한 로션/에센스', desc: '수분크림처럼 부드럽고 투명하게', icon: 'fa-droplet' },
    { id: '보송한 무기자차', label: '보송한 무기자차', desc: '유분기를 잡아주어 산뜻하게', icon: 'fa-soap' },
    { id: '간편한 스틱/쿠션', label: '간편한 스틱/쿠션', desc: '손에 묻지 않고 어디서나 슥슥', icon: 'fa-wand-magic-sparkles' },
    { id: '상관없음', label: '상관없음', desc: '내 피부에 가장 최적화된 제형으로', icon: 'fa-check' }
  ]
};

const AI_QUESTIONS = {
  3: { title: <>세안 후 아무것도 안 발랐을 때<br/>피부 상태는?</>, options: ['얼굴 전체가 심하게 당긴다', '이마/코는 괜찮은데 볼이 당긴다', '당김 없이 유분이 올라온다'] },
  4: { title: <>화장품을 바꿀 때 트러블이나<br/>붉어짐이 있나요?</>, options: ['자주 그렇다 (매우 민감)', '가끔 컨디션에 따라 다르다', '아무거나 발라도 괜찮다'] },
  5: { title: <>오후가 되었을 때 T존(이마,코)의<br/>상태는 어떤가요?</>, options: ['기름기가 거의 없이 건조하다', '적당히 윤기가 돈다', '기름기가 많아 번들거린다'] },
  6: { title: <>피부 두께와 붉은기 정도는<br/>어떠신가요?</>, options: ['피부가 얇고 핏줄이 잘 보이며 붉어짐', '보통이다', '피부가 두껍고 붉은기가 거의 없다'] },
  7: { title: <>환절기나 겨울철에 피부가<br/>어떻게 변하나요?</>, options: ['각질이 일거나 크게 뒤집어진다', '조금 건조해지는 정도다', '계절 변화를 크게 느끼지 않는다'] },
};

const calculateSkinType = (answers) => {
  if (!answers || !answers.diag1) return "미진단";
  return "수분 부족형 지성 및 민감성";
};

function ProfilePage() {
  const navigate = useNavigate();
  const mainRef = useRef(null); 
  const [step, setStep] = useState(STEPS.GENDER);
  const [answers, setAnswers] = useState({});
  const [isAutoNavigating, setIsAutoNavigating] = useState(false);
  const timerRef = useRef(null);

  // 스텝 변경 시 맨 위로 스크롤
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [step]);

  const currentField = STEP_FIELDS[step];
  const isCurrentStepAnswered = useMemo(() => {
    if (step === STEPS.AI_BRIDGE) return true;
    return !!answers[currentField];
  }, [step, answers, currentField]);

  const clearAutoNavTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setIsAutoNavigating(false);
  }, []);

  useEffect(() => { return () => clearAutoNavTimer(); }, [clearAutoNavTimer]);

  const getNextButtonText = () => {
    if (step === STEPS.AI_END) return '진단 완료하기';
    if (step === STEPS.AI_BRIDGE) return '맞춤 질문 이어가기';
    if (step === STEPS.FINAL) return '나만의 맞춤 선크림 분석하기';
    return '다음';
  };

  const handleNextStep = useCallback((currentAnswers, currentStep) => {
    clearAutoNavTimer();
    if (currentStep === STEPS.BASIC_TYPE) {
      currentAnswers.basicType === '모름' ? setStep(STEPS.AI_START) : setStep(STEPS.COMMON_START);
    } else if (currentStep === STEPS.AI_END) { setStep(STEPS.AI_BRIDGE);
    } else if (currentStep === STEPS.AI_BRIDGE) { setStep(STEPS.COMMON_START);
    } else if (currentStep === STEPS.FINAL) {
      const finalData = { ...currentAnswers };
      if (currentAnswers.basicType === '모름') finalData.basicType = calculateSkinType(currentAnswers);
      localStorage.setItem('userProfile', JSON.stringify(finalData));
      navigate('/result');
    } else { setStep(prev => prev + 1); }
  }, [navigate, clearAutoNavTimer]);

  const handleSelect = useCallback((field, value) => {
    clearAutoNavTimer();
    let newAnswers = { ...answers, [field]: value };
    if (field === 'basicType' && value !== '모름') {
      const { diag1, diag2, diag3, diag4, diag5, ...rest } = newAnswers;
      newAnswers = rest;
    }
    setAnswers(newAnswers);
    if (field === 'texture') return;
    setIsAutoNavigating(true);
    const currentStepSnapshot = step; 
    timerRef.current = setTimeout(() => { handleNextStep(newAnswers, currentStepSnapshot); }, 250);
  }, [answers, step, clearAutoNavTimer, handleNextStep]);

  const handlePrev = () => {
    clearAutoNavTimer();
    setStep(prev => {
      if (prev === STEPS.COMMON_START) return answers.diag1 ? STEPS.AI_BRIDGE : STEPS.BASIC_TYPE;
      if (prev === STEPS.AI_BRIDGE) return STEPS.AI_END;
      if (prev === STEPS.AI_START) return STEPS.BASIC_TYPE;
      return prev - 1;
    });
  };

  const progressPercentage = useMemo(() => {
    const isAiPath = !!answers.diag1 || step === STEPS.AI_BRIDGE || (step >= STEPS.AI_START && step <= STEPS.AI_END);
    let currentProgressIndex = step; let totalStepsCount = STEPS.FINAL;
    if (!isAiPath && step >= STEPS.COMMON_START) {
      const totalAiSteps = (STEPS.AI_END - STEPS.AI_START + 1) + 1; 
      currentProgressIndex = step - totalAiSteps; totalStepsCount = STEPS.FINAL - totalAiSteps;
    } else if (step === STEPS.AI_BRIDGE) { currentProgressIndex = STEPS.AI_END; }
    return (currentProgressIndex / totalStepsCount) * 100;
  }, [step, answers.diag1]);

  const displayedSkinType = useMemo(() => {
    return answers.basicType === '모름' || !answers.basicType ? calculateSkinType(answers) : answers.basicType;
  }, [answers]);

  const titleStyle = { textAlign: 'center', marginBottom: '30px', fontSize: '1.4rem', fontWeight: '900', color: '#222222', lineHeight: '1.4' };

  return (
    // 🌟 flex 구조를 통해 전체 화면에 꽉 차면서 삐져나가지 않게 복구했습니다.
    <div className="fade-in-up" style={{ backgroundColor: '#ffffff', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
        <div style={{ width: '24px' }}></div>
        <div style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{color: '#ff8c00'}}></i> AI 추천
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#1e293b', padding: 0 }}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>

      <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
        <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: '#ff8c00', transition: 'width 0.3s ease' }}></div>
      </div>

      <main ref={mainRef} style={{ flex: 1, padding: '30px 20px', overflowY: 'auto' }} key={step}>
        
        {step === STEPS.GENDER && (
          <div>
            <h2 style={titleStyle}>성별을 알려주세요.</h2>
            <div className="gender-wrap" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              {CONSTANTS.GENDER_OPTIONS.map(g => (
                <div key={g} onClick={() => handleSelect('gender', g)} 
                     className={`gender-card ${answers.gender === g ? (g === '남성' ? 'active-male' : 'active-female') : ''}`}
                     style={{ flex: 1, padding: '30px 10px', borderRadius: '16px', cursor: 'pointer', border: answers.gender === g ? `2px solid ${g === '남성' ? '#3b82f6' : '#ec4899'}` : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: answers.gender === g ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: g === '남성' ? '#3b82f6' : '#ec4899', color: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', transition: 'all 0.2s ease' }}>
                    <i className={`fa-solid ${g === '남성' ? 'fa-person' : 'fa-person-dress'}`}></i>
                  </div>
                  <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#222222' }}>{g}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === STEPS.BASIC_TYPE && (
          <div>
            <h2 style={titleStyle}>평소 느끼는 피부 타입은?</h2>
            <div className="option-list">
              {CONSTANTS.BASIC_TYPE_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => handleSelect('basicType', opt)} className={`option-btn ${answers.basicType === opt ? 'active' : ''}`}>{opt}</button>
              ))}
              <button onClick={() => handleSelect('basicType', '모름')} className={`option-btn unknown ${answers.basicType === '모름' ? 'active' : ''}`}>잘 모르겠음 (5단계 AI 정밀 진단)</button>
            </div>
          </div>
        )}

        {step >= STEPS.AI_START && step <= STEPS.AI_END && AI_QUESTIONS[step] && (
          <div>
            <h2 style={titleStyle}>
              <span style={{display:'block', fontSize:'0.9rem', color:'#ff8c00', marginBottom:'8px'}}>[진단 {step - 2}/5]</span>
              {AI_QUESTIONS[step].title}
            </h2>
            <div className="option-list">
              {AI_QUESTIONS[step].options.map((opt) => (
                <button key={opt} onClick={() => handleSelect(currentField, opt)} className={`option-btn ${answers[currentField] === opt ? 'active' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === STEPS.AI_BRIDGE && (
          <div className="bridge-container">
            <div className="bridge-icon-wrap">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h2 className="bridge-title" style={{...titleStyle, marginBottom:'15px', color:'#ff8c00'}}>AI 피부 진단 완료!</h2>
            <p className="bridge-description" style={{textAlign:'center', fontWeight:'700', fontSize:'1.1rem', color:'#222'}}>
              회원님의 답변을 기반으로 정밀 분석한 결과,<br />
              현재 피부는 <span style={{color:'#ff8c00', fontWeight:'900'}}>"{displayedSkinType}"</span> 상태입니다.
            </p>
            <div className="bridge-notice-box" style={{marginTop:'30px', padding:'15px', backgroundColor:'#f8fafc', borderRadius:'12px', fontSize:'0.95rem', fontWeight:'700', color:'#475569'}}>
              💡 이 결과를 바탕으로, 회원님께 딱 맞는 맞춤형 선크림을 추천하기 위해 <strong>마지막 3가지 취향 질문</strong>을 이어갈게요!
            </div>
          </div>
        )}

        {step === STEPS.COMMON_START && (
          <div>
            <h2 style={titleStyle}>주로 활동하는 환경은?</h2>
            <div className="option-list">
              {CONSTANTS.ENV_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => handleSelect('env', opt)} className={`option-btn ${answers.env === opt ? 'active' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === STEPS.CONCERN && (
          <div>
            <h2 style={titleStyle}>선크림 사용 시<br/>가장 꺼려지는 점은?</h2>
            <div className="option-list">
              {CONSTANTS.CONCERN_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => handleSelect('concern', opt)} className={`option-btn ${answers.concern === opt ? 'active' : ''}`}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {step === STEPS.FINAL && (
          <div>
            <h2 style={{...titleStyle, marginBottom:'15px'}}>마지막! 선호하는<br/>선크림 제형이 있나요?</h2>
            <p style={{textAlign:'center', color:'#64748b', fontWeight:'700', marginBottom:'25px'}}>가장 마음에 드는 스타일 하나를 선택해 주세요.</p>
            <div className="texture-grid-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CONSTANTS.TEXTURE_OPTIONS.map((item) => (
                <div key={item.id} onClick={() => handleSelect('texture', item.id)} className={`texture-card ${answers.texture === item.id ? 'active' : ''}`}>
                  <div className="texture-icon"><i className={`fa-solid ${item.icon}`}></i></div>
                  <div className="texture-text">
                    <span className="texture-label" style={{fontWeight:'900', color:'#222'}}>{item.label}</span>
                    <span className="texture-desc" style={{fontWeight:'600'}}>{item.desc}</span>
                  </div>
                  <div className="texture-checkbox">
                    <i className={`fa-solid ${answers.texture === item.id ? 'fa-circle-check' : 'fa-circle'}`}></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 🌟 삐져나가지 않게 원래대로 복구 (flexShrink: 0) */}
      <footer style={{ padding: '20px', display: 'flex', gap: '12px', backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
        {step > 1 && ( <button onClick={handlePrev} disabled={isAutoNavigating} style={{ flex: 1, padding: '16px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#64748b', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer' }}>이전</button> )}
        <button onClick={() => handleNextStep(answers, step)} disabled={!isCurrentStepAnswered || isAutoNavigating} style={{ flex: step > 1 ? 2 : 1, padding: '16px', borderRadius: '12px', backgroundColor: (!isCurrentStepAnswered || isAutoNavigating) ? '#cbd5e1' : '#ff8c00', color: '#ffffff', border: 'none', fontWeight: '900', fontSize: '1.05rem', cursor: (!isCurrentStepAnswered || isAutoNavigating) ? 'not-allowed' : 'pointer' }}>{getNextButtonText()}</button>
      </footer>
    </div>
  );
}

export default ProfilePage;