
import './Input.css'

function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
}) {
  return (
    <div className="input-group">
      {label && <label className="input-group__label">{label}</label>}
      <input
        className={`input-group__field ${error ? 'is-error' : ''}`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <p className="input-group__error">{error}</p>}
    </div>
  )
}

export default Input