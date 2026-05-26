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

  const handleAnalyze = async () => {
    if (!ingredientImg.file) {
      setError('분석할 사진을 먼저 업로드해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const response = await analyze(ingredientImg.file);
      const { task_id } = response;

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(async () => {
        try {
          const res = await getTaskStatus(task_id);

          if (res.status === 'COMPLETED') {
            clearInterval(intervalRef.current);
            setIsAnalyzing(false);
            // 💡 분석 결과 데이터를 state로 넘기며 마이페이지 이동
            navigate('/mypage', { state: { newAnalysis: res.result || res } });
          } else if (res.status === 'FAILED') {
            clearInterval(intervalRef.current);
            setIsAnalyzing(false);
            setError(`분석 실패: ${res.error || '알 수 없는 오류'}`);
          }
        } catch (err) {
          console.error("폴링 호출 에러:", err);
        }
      }, 2000);
    } catch (err) {
      console.error("API 요청 에러:", err);
      setError('서버 연결 중 문제가 발생했습니다.');
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  if (isAnalyzing) {
    return <div className="page"><Loading message="AI가 성분을 정밀 분석 중이에요... 잠시만 기다려주세요" /></div>
  }

  return (
    <div className="page scan">
      <div className="scan__header">
        <h1 className="scan__title">제품 성분 스캔</h1>
        <p className="scan__subtitle">성분표 사진을 올려주세요</p>
      </div>
      <ImageUploader previewUrl={ingredientImg.preview} onFileChange={ingredientImg.setFile} />
      {error && <p className="scan__error">{error}</p>}
      <Button size="lg" onClick={handleAnalyze}>AI 분석하기 🔍</Button>
    </div>
  )
}

export default ScanPage