
import './Button.css'

function Button({
  children,
  variant = 'primary',   // primary | secondary | outline
  size = 'md',           // md | lg
  type = 'button',
  disabled = false,
  onClick,
}) {
  const className = `btn btn--${variant} btn--${size}`
  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button