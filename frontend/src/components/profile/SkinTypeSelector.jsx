
import './SkinTypeSelector.css'

const OPTIONS = ['지성', '건성', '복합성', '중성', '민감성']

function SkinTypeSelector({ value, onChange }) {
  return (
    <div className="skin-type">
      <label className="skin-type__label">피부 타입</label>
      <div className="skin-type__grid">
        {OPTIONS.map((option) => (
          <button
            type="button"
            key={option}
            className={`skin-type__option ${value === option ? 'is-active' : ''}`}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SkinTypeSelector
