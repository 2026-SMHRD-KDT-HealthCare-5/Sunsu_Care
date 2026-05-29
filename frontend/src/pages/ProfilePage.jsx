import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchProfile, updateProfile } from '../api/profileApi';
import './ProfilePage.css';

/* ==========================================================================
   상수 (매직 넘버/문자열 제거)
   ========================================================================== */
const STEPS = {
  GENDER: 1,
  BASIC_TYPE: 2,
  AI_START: 3,
  AI_END: 7,
  AI_BRIDGE: 8,
  COMMON_START: 9,
  CONCERN: 10,
  FINAL: 11
};

const STEP_FIELDS = {
  1: 'gender', 2: 'basicType',
  3: 'diag1', 4: 'diag2', 5: 'diag3', 6: 'diag4', 7: 'diag5',
  9: 'env', 10: 'concern', 11: 'texture'
};

const AUTO_NAV_DELAY = 250;
const DEFAULT_FROM = '/';
const NEXT_PATH_ON_COMPLETE = '/scan';
const PRELOAD_TRIGGER_PATH = '/mypage';

const CONSTANTS = {
  GENDER_OPTIONS: ['남성', '여성'],
  BASIC_TYPE_OPTIONS: [
    '건성 (세안 후 당김이 심해요)',
    '지성 (오후가 되면 번들거려요)',
    '복합성 (T존 지성, U존 건성)',
    '중성 (밸런스가 적당해요)',
    '민감성 (화장품이 자주 안 맞아요)'
  ],
  ENV_OPTIONS: ['실내 (사무실/학교)', '야외 활동 (운동/현장)', '블루라이트 노출 많음'],
  CONCERN_OPTIONS: [
    '얼굴이 허옇게 뜨는 백탁',
    '바를 때 눈이 시림',
    '모공 막힘 및 트러블',
    '끈적이고 답답함'
  ],
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

/* ==========================================================================
   유틸 함수
   ========================================================================== */
const calculateSkinType = (answers) => {
  if (!answers || !answers.diag1) return "미진단";
  return "수분 부족형 지성 및 민감성";
};

// DB → answers 매핑 (MyPage→Profile 진입 시 기존 값 미리 표시)
const mapDbToAnswers = (dbProfile) => ({
  basicType: dbProfile.skin_type || undefined,
  env: dbProfile.activity_env || undefined,
  texture: dbProfile.prod_type || undefined,
  concern: Array.isArray(dbProfile.avoid_ingredient)
    ? dbProfile.avoid_ingredient[0]
    : (dbProfile.avoid_ingredient || undefined)
});

/* ==========================================================================
   컴포넌트
   ========================================================================== */
function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef(null);
  const timerRef = useRef(null);

  // 진입 출처 (닫기/이전 시 복귀할 곳)
  const fromPath = location.state?.from || DEFAULT_FROM;

  const [step, setStep] = useState(STEPS.GENDER);
  const [answers, setAnswers] = useState({});
  const [isAutoNavigating, setIsAutoNavigating] = useState(false);

  // 🌟 MyPage 진입 시 기존 프로필 로드 → 마지막 단계로 점프 (재설문 부담 ↓)
  useEffect(() => {
    if (fromPath !== PRELOAD_TRIGGER_PATH) return;

    const preloadExistingProfile = async () => {
      try {
        const dbProfile = await fetchProfile();
        if (dbProfile && dbProfile.skin_type) {
          setAnswers(mapDbToAnswers(dbProfile));
          setStep(STEPS.FINAL);
        }
      } catch (err) {
        console.error("기존 프로필 로드 실패:", err);
      }
    };
    preloadExistingProfile();
  }, [fromPath]);

  // 스텝 변경 시 스크롤 위로
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [step]);

  const currentField = STEP_FIELDS[step];

  const isCurrentStepAnswered = useMemo(() => {
    if (step === STEPS.AI_BRIDGE) return true;
    return !!answers[currentField];
  }, [step, answers, currentField]);

  const clearAutoNavTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsAutoNavigating(false);
  }, []);

  useEffect(() => () => clearAutoNavTimer(), [clearAutoNavTimer]);

  const getNextButtonText = () => {
    if (step === STEPS.AI_END) return '진단 완료하기';
    if (step === STEPS.AI_BRIDGE) return '맞춤 질문 이어가기';
    if (step === STEPS.FINAL) return '나만의 맞춤 선크림 분석하기';
    return '다음';
  };

  const handleNextStep = useCallback(async (currentAnswers, currentStep) => {
    clearAutoNavTimer();

    if (currentStep === STEPS.BASIC_TYPE) {
      setStep(currentAnswers.basicType === '모름' ? STEPS.AI_START : STEPS.COMMON_START);
    } else if (currentStep === STEPS.AI_END) {
      setStep(STEPS.AI_BRIDGE);
    } else if (currentStep === STEPS.AI_BRIDGE) {
      setStep(STEPS.COMMON_START);
    } else if (currentStep === STEPS.FINAL) {
      const finalData = { ...currentAnswers };
      if (currentAnswers.basicType === '모름') {
        finalData.basicType = calculateSkinType(currentAnswers);
      }

      // 로컬 저장 (오프라인 fallback)
      localStorage.setItem('userProfile', JSON.stringify(finalData));

      // 🌟 백엔드 DB 저장 (MyPage fetchProfile 에서 사용)
      const dbPayload = {
        skin_type: finalData.basicType,
        activity_env: finalData.env,
        prod_type: finalData.texture,
        avoid_ingredient: finalData.concern
      };

      try {
        await updateProfile(dbPayload);
        navigate(NEXT_PATH_ON_COMPLETE);
      } catch (error) {
        console.error("프로필 저장 실패:", error);
        alert("프로필 저장에 실패했습니다. 다시 시도해주세요.");
      }
    } else {
      setStep(prev => prev + 1);
    }
  }, [navigate, clearAutoNavTimer]);

  const handleSelect = useCallback((field, value) => {
    clearAutoNavTimer();
    let newAnswers = { ...answers, [field]: value };

    if (field === 'basicType' && value !== '모름') {
      const { diag1, diag2, diag3, diag4, diag5, ...rest } = newAnswers;
      newAnswers = rest;
    }

    setAnswers(newAnswers);

    // 마지막 단계는 자동 진행 X (사용자가 직접 완료 버튼 클릭)
    if (field === 'texture') return;

    setIsAutoNavigating(true);
    const currentStepSnapshot = step;
    timerRef.current = setTimeout(() => {
      handleNextStep(newAnswers, currentStepSnapshot);
    }, AUTO_NAV_DELAY);
  }, [answers, step, clearAutoNavTimer, handleNextStep]);

  const handlePrev = () => {
    clearAutoNavTimer();
    if (step === STEPS.GENDER) {
      navigate(fromPath);
      return;
    }
    setStep(prev => {
      if (prev === STEPS.COMMON_START) return answers.diag1 ? STEPS.AI_BRIDGE : STEPS.BASIC_TYPE;
      if (prev === STEPS.AI_BRIDGE) return STEPS.AI_END;
      if (prev === STEPS.AI_START) return STEPS.BASIC_TYPE;
      return prev - 1;
    });
  };

  const handleClose = () => navigate(fromPath);

  const progressPercentage = useMemo(() => {
    const isAiPath = !!answers.diag1 || step === STEPS.AI_BRIDGE || (step >= STEPS.AI_START && step <= STEPS.AI_END);
    let currentProgressIndex = step;
    let totalStepsCount = STEPS.FINAL;

    if (!isAiPath && step >= STEPS.COMMON_START) {
      const totalAiSteps = (STEPS.AI_END - STEPS.AI_START + 1) + 1;
      currentProgressIndex = step - totalAiSteps;
      totalStepsCount = STEPS.FINAL - totalAiSteps;
    } else if (step === STEPS.AI_BRIDGE) {
      currentProgressIndex = STEPS.AI_END;
    }
    return (currentProgressIndex / totalStepsCount) * 100;
  }, [step, answers.diag1]);

  const displayedSkinType = useMemo(() => {
    return answers.basicType === '모름' || !answers.basicType
      ? calculateSkinType(answers)
      : answers.basicType;
  }, [answers]);

  return (
    <div className="page survey fade-in-up">
      <header className="survey-header">
        <div className="header-side" aria-hidden="true"></div>
        <div className="survey-logo">프로필 설정</div>
        <button
          type="button"
          className="close-btn"
          onClick={handleClose}
          aria-label="닫기"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>

      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <main ref={mainRef} className="survey-main" key={step}>

        {/* Step 1: 성별 */}
        {step === STEPS.GENDER && (
          <div>
            <h2 className="question-title">성별을 알려주세요.</h2>
            <div className="gender-wrap">
              {CONSTANTS.GENDER_OPTIONS.map(g => (
                <div
                  key={g}
                  onClick={() => handleSelect('gender', g)}
                  className={`gender-card ${answers.gender === g ? (g === '남성' ? 'active-male' : 'active-female') : ''}`}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`gender-icon ${g === '남성' ? 'male' : 'female'}`}>
                    <i className={`fa-solid ${g === '남성' ? 'fa-person' : 'fa-person-dress'}`}></i>
                  </div>
                  <span className="gender-label">{g}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 기본 피부 타입 */}
        {step === STEPS.BASIC_TYPE && (
          <div>
            <h2 className="question-title">평소 느끼는 피부 타입은?</h2>
            <div className="option-list">
              {CONSTANTS.BASIC_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect('basicType', opt)}
                  className={`option-btn ${answers.basicType === opt ? 'active' : ''}`}
                >
                  {opt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleSelect('basicType', '모름')}
                className={`option-btn unknown ${answers.basicType === '모름' ? 'active' : ''}`}
              >
                잘 모르겠음 (5단계 AI 정밀 진단)
              </button>
            </div>
          </div>
        )}

        {/* Step 3~7: AI 진단 */}
        {step >= STEPS.AI_START && step <= STEPS.AI_END && AI_QUESTIONS[step] && (
          <div>
            <h2 className="question-title">
              <span className="question-subtitle">[진단 {step - 2}/5]</span>
              {AI_QUESTIONS[step].title}
            </h2>
            <div className="option-list">
              {AI_QUESTIONS[step].options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(currentField, opt)}
                  className={`option-btn ${answers[currentField] === opt ? 'active' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: AI 브릿지 */}
        {step === STEPS.AI_BRIDGE && (
          <div className="bridge-container">
            <div className="bridge-icon-wrap">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h2 className="bridge-title">AI 피부 진단 완료!</h2>
            <p className="bridge-description">
              회원님의 답변을 기반으로 정밀 분석한 결과,<br />
              현재 피부는 <span className="highlight">"{displayedSkinType}"</span> 상태입니다.
            </p>
            <div className="bridge-notice-box">
              💡 이 결과를 바탕으로, 회원님께 딱 맞는 맞춤형 선크림을 추천하기 위해 <strong>마지막 3가지 취향 질문</strong>을 이어갈게요!
            </div>
          </div>
        )}

        {/* Step 9: 공통 - 활동 환경 */}
        {step === STEPS.COMMON_START && (
          <div>
            <h2 className="question-title">주로 활동하는 환경은?</h2>
            <div className="option-list">
              {CONSTANTS.ENV_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect('env', opt)}
                  className={`option-btn ${answers.env === opt ? 'active' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 10: 공통 - 꺼려지는 점 */}
        {step === STEPS.CONCERN && (
          <div>
            <h2 className="question-title">선크림 사용 시<br/>가장 꺼려지는 점은?</h2>
            <div className="option-list">
              {CONSTANTS.CONCERN_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect('concern', opt)}
                  className={`option-btn ${answers.concern === opt ? 'active' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 11: 최종 - 제형 */}
        {step === STEPS.FINAL && (
          <div>
            <h2 className="question-title">마지막! 선호하는<br/>선크림 제형이 있나요?</h2>
            <p className="question-desc-sub">가장 마음에 드는 스타일 하나를 선택해 주세요.</p>
            <div className="texture-grid-wrap">
              {CONSTANTS.TEXTURE_OPTIONS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect('texture', item.id)}
                  className={`texture-card ${answers.texture === item.id ? 'active' : ''}`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="texture-icon">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div className="texture-text">
                    <span className="texture-label">{item.label}</span>
                    <span className="texture-desc">{item.desc}</span>
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

      <footer className={`survey-footer ${step === STEPS.FINAL ? 'final-step' : ''}`}>
        <button
          type="button"
          className="nav-btn prev"
          onClick={handlePrev}
          disabled={isAutoNavigating}
        >
          이전
        </button>
        <button
          type="button"
          className="nav-btn next"
          onClick={() => handleNextStep(answers, step)}
          disabled={!isCurrentStepAnswered || isAutoNavigating}
        >
          {getNextButtonText()}
        </button>
      </footer>
    </div>
  );
}

export default ProfilePage;
