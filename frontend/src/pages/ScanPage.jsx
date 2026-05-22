// frontend/src/pages/ScanPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import ImageUploader from '../components/product/ImageUploader'
import { analyze, getTaskStatus } from '../api/analysisApi'
import { getProfile } from '../utils/storage'
import { useImagePreview } from '../hooks/useImagePreview'
import './ScanPage.css'

function ScanPage() {
  const navigate = useNavigate()
  const ingredientImg = useImagePreview()
  
  const intervalRef = useRef(null);

  const [error, setError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    setHasProfile(!!getProfile())
  }, [])

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
        // 1. 서버에 분석 요청
        const { task_id } = await analyze(ingredientImg.file);

        // 2. 폴링 시작
        intervalRef.current = setInterval(async () => {
            try {
                const statusData = await getTaskStatus(task_id);
                
                if (statusData.status === 'completed') {
                    clearInterval(intervalRef.current);
                    navigate('/result/' + task_id);
                } else if (statusData.status === 'failed') {
                    clearInterval(intervalRef.current);
                    setError('분석에 실패했습니다.');
                    setIsAnalyzing(false);
                }
            } catch (err) {
                clearInterval(intervalRef.current);
                setError('상태 확인 중 오류가 발생했습니다.');
                setIsAnalyzing(false);
            }
        }, 2000); 
    } catch (err) {
        setError('분석 요청에 실패했습니다.');
        setIsAnalyzing(false);
    }
  };

  // 4. 컴포넌트 언마운트 시 인터벌 정리
  useEffect(() => {
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (isAnalyzing) {
    return (
      <div className="page">
        <Loading message="AI가 성분을 정밀 분석 중이에요... 잠시만 기다려주세요" />
      </div>
    )
  }

  return (
    <div className="page scan">
      <div className="scan__header">
        <h1 className="scan__title">제품 성분 스캔</h1>
        <p className="scan__subtitle">성분표 사진을 올려주세요</p>
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

      <ImageUploader
        label="성분표 사진"
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