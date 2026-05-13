
import { useEffect } from 'react'
import './Modal.css'

function Modal({ isOpen, onClose, title, children, hideDefaultButton = false }) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="modal__title">{title}</h3>}
        <div className="modal__body">{children}</div>
        {!hideDefaultButton && (
          <button className="modal__close" onClick={onClose}>확인</button>
        )}
      </div>
    </div>
  )
}

export default Modal