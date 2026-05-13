
import './PreferenceSelector.css'

const OPTIONS = [
  { value: '유기자차', desc: '발림 좋고 가벼움' },
  { value: '무기자차', desc: '민감 피부에 적합' },
  { value: '혼합',     desc: '두 타입의 균형' },
]

function PreferenceSelector({ value, onChange }) {
  return (
    <div className="prefer">
      <label className="prefer__label">선호 선크림 타입</label>
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