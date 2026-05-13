// src/pages/GuidePage.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import { getProfile, getLastResult } from '../utils/storage'
import { fetchProfile } from '../api/profileApi'
import {
  guideSteps,
  tipsByType,
  sensitiveTips,
  riskIngredientTips,
} from '../data/mockGuide'
import './GuidePage.css'

function GuidePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchProfile().then(setProfile)
    setResult(getLastResult())
  }, [])

  // 피부 타입별 팁 (프로필 있을 때만)
  const typeTips = profile?.skin_type ? tipsByType[profile.skin_type] : null

  // 민감 피부 팁 (프로필이 sensitive=true일 때만)
  const showSensitiveTips = profile?.senstive_yn >= 3

  // 분석 결과의 주의 성분에 매칭되는 팁
  const riskTips = (result?.analysis_result?.risk_ingredients || [])
    .map((item) => riskIngredientTips[item.name])
    .filter(Boolean)

  // 헤더 문구
  const headerText = profile?.skin_type
    ? `${profile.skin_type}${profile.senstive_yn >= 3 ? '·민감' : ''} 피부를 위한`
    : '맞춤'

  return (
    <div className="page guide">
      <div className="guide__header">
        <span className="guide__emoji">🧴</span>
        <h1 className="guide__title">{headerText} 세안 가이드</h1>
        <p className="guide__subtitle">순서대로 따라하면 더 효과적이에요</p>
      </div>

      {/* 기본 5단계 */}
      <section className="guide__section">
        <h2 className="guide__section-title">기본 세안 5단계</h2>
        <ol className="guide__steps">
          {guideSteps.map((step) => (
            <li key={step.number} className="guide__step">
              <div className="guide__step-left">
                <span className="guide__step-icon">{step.icon}</span>
                <span className="guide__step-num">STEP {step.number}</span>
              </div>
              <div className="guide__step-body">
                <h3 className="guide__step-title">{step.title}</h3>
                <p className="guide__step-desc">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 피부 타입별 추가 팁 */}
      {typeTips && (
        <section className="guide__section guide__section--tip">
          <h2 className="guide__section-title">
            💡 {profile.skin_type} 피부 추가 팁
          </h2>
          <ul className="guide__tips">
            {typeTips.map((tip, idx) => (
              <li key={idx} className="guide__tip">{tip}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 민감 피부 추가 팁 */}
      {showSensitiveTips && (
        <section className="guide__section guide__section--tip">
          <h2 className="guide__section-title">🌸 민감 피부 주의사항</h2>
          <ul className="guide__tips">
            {sensitiveTips.map((tip, idx) => (
              <li key={idx} className="guide__tip">{tip}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 분석한 제품의 주의 성분별 팁 */}
      {riskTips.length > 0 && (
        <section className="guide__section guide__section--warn">
          <h2 className="guide__section-title">
            ⚠️ 분석한 제품의 주의 성분 케어
          </h2>
          <ul className="guide__tips">
            {riskTips.map((tip, idx) => (
              <li key={idx} className="guide__tip">{tip}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 프로필 없으면 안내 */}
      {!profile && (
        <div className="guide__notice">
          더 정확한 맞춤 가이드를 원하시면 피부 정보를 입력해주세요.{' '}
          <button
            type="button"
            className="guide__notice-link"
            onClick={() => navigate('/profile')}
          >
            입력하러 가기 →
          </button>
        </div>
      )}

      <div className="guide__actions">
        <Button variant="outline" onClick={() => navigate('/')}>
          🏠 홈으로
        </Button>
        <Button onClick={() => navigate('/scan')}>
          🔍 다른 제품 분석
        </Button>
      </div>
    </div>
  )
}

export default GuidePage