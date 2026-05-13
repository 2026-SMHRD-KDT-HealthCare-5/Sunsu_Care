
// src/pages/ScanPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import ProductInput from '../components/product/ProductInput'
import ImageUploader from '../components/product/ImageUploader'
import { analyze } from '../api/analysisApi'
import {
  getProfile,
  setLastResult,
  addHistory,
} from '../utils/storage'
import { useImagePreview } from '../hooks/useImagePreview'
import './ScanPage.css'

function ScanPage() {
  const navigate = useNavigate()

  const [productName, setProductName] = useState('')
  const productImg = useImagePreview()
  const ingredientImg = useImagePreview()

  const [error, setError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    setHasProfile(!!getProfile())
  }, [])

  const handleAnalyze = async () => {
    setError('')

    if (!productName.trim()) {
      setError('제품명을 입력해주세요.')
      return
    }
    if (!ingredientImg.file) {
      setError('성분표 사진을 업로드해주세요.')
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await analyze({
        prod_name: productName,
        product_image: productImg.file,
        ingredient_image: ingredientImg.file,
      })

      setLastResult(result)
      addHistory({
        analysis_idx: result.analysis_idx,
        prod_name: result.prod_name,
        suitability_score: result.suitability_score,
        status: result.analysis_result?.status,
        analyzed_at: result.analyzed_at,
        // 상세 페이지용 전체 결과
        _full: result,
      })
      navigate('/result')
    } catch (err) {
      setError('분석 중 오류가 발생했어요. 다시 시도해주세요.')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  return (
    <div className="page scan">
      <div className="scan__header">
        <h1 className="scan__title">제품 성분 스캔</h1>
        <p className="scan__subtitle">제품명과 성분표 사진을 올려주세요</p>
      </div>

      {!hasProfile && (
        <div className="scan__notice">
          ⚠️ 아직 피부 정보를 입력하지 않았어요.{' '}
          <button
            type="button"
            className="scan__notice-link"
            onClick={() => navigate('/profile')}
          >
            지금 입력하러 가기 →
          </button>
        </div>
      )}

      <ProductInput
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />

      <ImageUploader
        label="제품 사진 (선택)"
        previewUrl={productImg.preview}
        onFileChange={productImg.setFile}
      />

      <ImageUploader
        label="성분표 사진 (필수)"
        previewUrl={ingredientImg.preview}
        onFileChange={ingredientImg.setFile}
      />

      {error && <p className="scan__error">{error}</p>}

      <Button size="lg" onClick={handleAnalyze}>
        AI 분석하기 🔍
      </Button>
    </div>
  )
}

export default ScanPage

