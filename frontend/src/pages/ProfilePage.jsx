
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import SkinTypeSelector from '../components/profile/SkinTypeSelector'
import PreferenceSelector from '../components/profile/PreferenceSelector'
import AvoidIngredientInput from '../components/profile/AvoidIngredientInput'
import { PROFILE_OPTIONS } from '../data/mockUserProfile'
import { getProfile, saveProfile } from '../utils/storage'
import './ProfilePage.css'

const DEFAULT_PROFILE = {
  gender: '',
  skinType: '',
  sensitive: false,
  preferType: '',
  avoidIngredients: [],
  concerns: [],
}

function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [showSaved, setShowSaved] = useState(false)

  // 페이지 열릴 때 저장된 프로필이 있으면 불러오기
  useEffect(() => {
    const saved = getProfile()
    if (saved) setProfile({ ...DEFAULT_PROFILE, ...saved })
  }, [])

  // 한 필드만 업데이트하는 헬퍼
  const updateField = (key, val) => {
    setProfile((prev) => ({ ...prev, [key]: val }))
  }

  // 피부 고민 토글 (있으면 빼고, 없으면 추가)
  const toggleConcern = (concern) => {
    setProfile((prev) => {
      const has = prev.concerns.includes(concern)
      return {
        ...prev,
        concerns: has
          ? prev.concerns.filter((c) => c !== concern)
          : [...prev.concerns, concern],
      }
    })
  }

  const handleSave = () => {
    saveProfile(profile)
    setShowSaved(true)
  }

  const handleAfterSave = () => {
    setShowSaved(false)
    navigate('/scan')
  }

  return (
    <div className="page profile">
      <div className="profile__header">
        <h1 className="profile__title">피부 정보 입력</h1>
        <p className="profile__subtitle">
          더 정확한 추천을 위해 알려주세요
        </p>
      </div>

      {/* 성별 */}
      <div className="profile__field">
        <label className="profile__label">성별</label>
        <div className="profile__radio-row">
          {PROFILE_OPTIONS.gender.map((g) => (
            <button
              type="button"
              key={g}
              className={`profile__radio ${profile.gender === g ? 'is-active' : ''}`}
              onClick={() => updateField('gender', g)}
            >
              {g === 'male' ? '남성' : '여성'}
            </button>
          ))}
        </div>
      </div>

      <SkinTypeSelector
        value={profile.skinType}
        onChange={(v) => updateField('skinType', v)}
      />

      {/* 민감도 */}
      <div className="profile__field">
        <label className="profile__toggle">
          <input
            type="checkbox"
            checked={profile.sensitive}
            onChange={(e) => updateField('sensitive', e.target.checked)}
          />
          <span>민감한 피부예요</span>
        </label>
      </div>

      <PreferenceSelector
        value={profile.preferType}
        onChange={(v) => updateField('preferType', v)}
      />

      <AvoidIngredientInput
        value={profile.avoidIngredients}
        onChange={(v) => updateField('avoidIngredients', v)}
      />

      {/* 피부 고민 (복수 선택) */}
      <div className="profile__field">
        <label className="profile__label">피부 고민 (복수 선택)</label>
        <div className="profile__concerns">
          {PROFILE_OPTIONS.concerns.map((c) => (
            <button
              type="button"
              key={c}
              className={`profile__chip ${
                profile.concerns.includes(c) ? 'is-active' : ''
              }`}
              onClick={() => toggleConcern(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Button size="lg" onClick={handleSave}>
        저장하고 분석하러 가기 →
      </Button>

      <Modal
        isOpen={showSaved}
        onClose={handleAfterSave}
        title="저장 완료 ✅"
      >
        피부 정보가 저장되었어요.
        <br />
        이제 제품을 분석해볼까요?
      </Modal>
    </div>
  )
}

export default ProfilePage