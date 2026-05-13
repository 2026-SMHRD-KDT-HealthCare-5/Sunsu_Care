// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import SkinTypeSelector from '../components/profile/SkinTypeSelector'
import PreferenceSelector from '../components/profile/PreferenceSelector'
import AvoidIngredientInput from '../components/profile/AvoidIngredientInput'
import { PROFILE_OPTIONS } from '../data/mockUserProfile'
import { fetchProfile, updateProfile } from '../api/profileApi'
import './ProfilePage.css'

const DEFAULT_PROFILE = {
  skin_type: '',
  senstive_yn: 0,           // 0=미선택, 1~5
  prod_type: '',
  avoid_ingredient: [],     // 배열 (API가 자동 변환)
}

function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [showSaved, setShowSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProfile().then((saved) => {
      if (saved) setProfile({ ...DEFAULT_PROFILE, ...saved })
    })
  }, [])

  const updateField = (key, val) => {
    setProfile((prev) => ({ ...prev, [key]: val }))
  }

  const handleSave = async () => {
    setSubmitting(true)
    try {
      await updateProfile(profile)
      setShowSaved(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAfterSave = () => {
    setShowSaved(false)
    navigate('/scan')
  }

  return (
    <div className="page profile">
      <div className="profile__header">
        <h1 className="profile__title">피부 정보 입력</h1>
        <p className="profile__subtitle">더 정확한 추천을 위해 알려주세요</p>
      </div>

      <SkinTypeSelector
        value={profile.skin_type}
        onChange={(v) => updateField('skin_type', v)}
      />

      {/* 민감도 레벨 (1~5) */}
      <div className="profile__field">
        <label className="profile__label">민감도 레벨</label>
        <div className="profile__levels">
          {PROFILE_OPTIONS.sensitivity.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className={`profile__level ${
                profile.senstive_yn === opt.value ? 'is-active' : ''
              }`}
              onClick={() => updateField('senstive_yn', opt.value)}
            >
              <strong>{opt.value}</strong>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <PreferenceSelector
        value={profile.prod_type}
        onChange={(v) => updateField('prod_type', v)}
      />

      <AvoidIngredientInput
        value={profile.avoid_ingredient}
        onChange={(v) => updateField('avoid_ingredient', v)}
      />

      <Button size="lg" onClick={handleSave} disabled={submitting}>
        {submitting ? '저장 중...' : '저장하고 분석하러 가기 →'}
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