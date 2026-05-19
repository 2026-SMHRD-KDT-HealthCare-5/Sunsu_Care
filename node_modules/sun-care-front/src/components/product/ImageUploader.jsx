// src/components/product/ImageUploader.jsx
import { useRef } from 'react'
import './ImageUploader.css'

function ImageUploader({ label, previewUrl, onFileChange }) {
  // 숨겨둔 file input에 접근하기 위한 ref
  const inputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지만 허용
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능해요')
      return
    }

    onFileChange(file)
  }

  const handlePickClick = () => {
    inputRef.current?.click()
  }

  const handleRemove = () => {
    onFileChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="uploader">
      {label && <label className="uploader__label">{label}</label>}

      {!previewUrl ? (
        // 업로드 전: 빈 박스
        <button
          type="button"
          className="uploader__drop"
          onClick={handlePickClick}
        >
          <span className="uploader__icon">📷</span>
          <span className="uploader__text">사진 업로드</span>
          <span className="uploader__hint">눌러서 파일 선택</span>
        </button>
      ) : (
        // 업로드 후: 미리보기 + 변경/삭제 버튼
        <div className="uploader__preview">
          <img src={previewUrl} alt="미리보기" className="uploader__img" />
          <div className="uploader__actions">
            <button
              type="button"
              className="uploader__action"
              onClick={handlePickClick}
            >
              변경
            </button>
            <button
              type="button"
              className="uploader__action uploader__action--danger"
              onClick={handleRemove}
            >
              삭제
            </button>
          </div>
        </div>
      )}

      {/* 실제 파일 input은 숨겨두고, 위 버튼들이 대신 클릭 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  )
}

export default ImageUploader