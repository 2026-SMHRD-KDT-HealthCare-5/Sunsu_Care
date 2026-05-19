// File 객체 + 미리보기 URL을 한 묶음으로 관리. URL 해제(메모리 정리)까지 자동.

import { useState, useEffect } from 'react'

export function useImagePreview() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    // 파일이 없으면 미리보기도 비움
    if (!file) {
      setPreview('')
      return
    }

    // 미리보기 URL 생성
    const url = URL.createObjectURL(file)
    setPreview(url)

    // cleanup: file이 바뀌거나 컴포넌트 unmount 시 URL 해제
    return () => URL.revokeObjectURL(url)
  }, [file])

  const clear = () => setFile(null)

  return { file, preview, setFile, clear }
}