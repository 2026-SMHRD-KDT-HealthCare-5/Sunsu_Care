
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import ScoreCard from '../components/result/ScoreCard'
import ReportSummary from '../components/result/ReportSummary'
import RiskIngredientList from '../components/result/RiskIngredientList'
import RecommendProductList from '../components/result/RecommendProductList'
import { getLastResult } from '../utils/storage'
import './ResultPage.css'

function ResultPage() {
  const navigate = useNavigate()
  // undefined = 아직 로딩 / null = 결과 없음 / 객체 = 결과 있음
  const [result, setResult] = useState(undefined)

  useEffect(() => {
    setResult(getLastResult())
  }, [])

  // 1) 로딩 중
  if (result === undefined) {
    return null
  }

  // 2) 결과 없음
  if (!result) {
    return (
      <div className="page result-empty">
        <div className="result-empty__icon">📊</div>
        <h1 className="result-empty__title">
          아직 분석 결과가 없어요
        </h1>
        <p className="result-empty__desc">
          제품을 스캔하면 결과가 여기에 나타나요.
        </p>
        <Button size="lg" onClick={() => navigate('/scan')}>
          제품 분석하러 가기 →
        </Button>
      </div>
    )
  }

  // 3) 정상 결과
  return (
    <div className="page result">
      <ScoreCard result={result} />

      <ReportSummary
        keyIngredients={result.keyIngredients}
        reason={result.reason}
      />

      <RiskIngredientList items={result.riskIngredients} />

      <RecommendProductList productIds={result.recommendations} />

      <div className="result__actions">
        <Button variant="outline" onClick={() => navigate('/scan')}>
          🔄 재분석
        </Button>
        <Button onClick={() => navigate('/guide')}>
          🧴 세안 가이드
        </Button>
      </div>
    </div>
  )
}

export default ResultPage