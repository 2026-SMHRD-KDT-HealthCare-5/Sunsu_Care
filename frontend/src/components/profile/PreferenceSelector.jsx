
import './PreferenceSelector.css'

const OPTIONS = [
  { value: '에센스',   desc: '가볍고 산뜻한 발림' },
  { value: '크림',     desc: '풍부한 보습력' },
  { value: '젤',       desc: '청량하고 빠른 흡수' },
  { value: '스틱',     desc: '휴대용, 핀포인트' },
  { value: '스프레이', desc: '간편한 분사형' },
]

function PreferenceSelector({ value, onChange }) {
  return (
    <div className="prefer">
      <label className="prefer__label">선호 제형</label>
      <div className="prefer__list">
        {OPTIONS.map((option) => (
          <button
            type="button"
            key={option.value}
            className={`prefer__option ${value === option.value ? 'is-active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            <strong>{option.value}</strong>
            <span>{option.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PreferenceSelector