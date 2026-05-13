
import { useState } from 'react'
import './AvoidIngredientInput.css'

const QUICK = ['옥시벤존', '향료', '에탄올', '파라벤', '실리콘']

function AvoidIngredientInput({ value = [], onChange }) {
  const [input, setInput] = useState('')

  const addIngredient = (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (value.includes(trimmed)) return
    onChange([...value, trimmed])
  }

  const handleAdd = () => {
    addIngredient(input)
    setInput('')
  }

  const handleRemove = (name) => {
    onChange(value.filter((v) => v !== name))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="avoid">
      <label className="avoid__label">기피 성분</label>

      <div className="avoid__row">
        <input
          className="avoid__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="성분명 입력 후 Enter"
        />
        <button type="button" className="avoid__btn" onClick={handleAdd}>
          추가
        </button>
      </div>

      <div className="avoid__quick">
        <span className="avoid__quick-label">자주 기피:</span>
        {QUICK.map((q) => (
          <button
            type="button"
            key={q}
            className="avoid__quick-btn"
            onClick={() => addIngredient(q)}
            disabled={value.includes(q)}
          >
            + {q}
          </button>
        ))}
      </div>

      {value.length > 0 && (
        <ul className="avoid__tags">
          {value.map((name) => (
            <li key={name} className="avoid__tag">
              {name}
              <button
                type="button"
                className="avoid__tag-x"
                onClick={() => handleRemove(name)}
                aria-label={`${name} 삭제`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AvoidIngredientInput