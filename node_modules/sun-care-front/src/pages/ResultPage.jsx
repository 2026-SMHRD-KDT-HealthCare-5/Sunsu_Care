// src/pages/ResultPage.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import ScoreCard from '../components/result/ScoreCard'
import ReportSummary from '../components/result/ReportSummary'
import RiskIngredientList from '../components/result/RiskIngredientList'
import RecommendProductList from '../components/result/RecommendProductList'
import { getLastResult } from '../utils/storage'
import { fetchRecommendations } from '../api/analysisApi'
import './ResultPage.css'

function ResultPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState(undefined)
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    const r = getLastResult()
    setResult(r)
    if (r?.analysis_idx) {
      fetchRecommendations(r.analysis_idx).then(setRecommendations)
    }
  }, [])

  if (result === undefined) return null

  if (!result) {
    return (
      <div className="page result-empty">
        <div className="result-empty__icon">📊</div>
        <h1 className="result-empty__title">아직 분석 결과가 없어요</h1>
        <p className="result-empty__desc">
          제품을 스캔하면 결과가 여기에 나타나요.
        </p>
        <Button size="lg" onClick={() => navigate('/scan')}>
          제품 분석하러 가기 →
        </Button>
      </div>
    )
  }

  const ar = result.analysis_result || {}

  return (
    <div className="page result">
      <ScoreCard
        prod_name={result.prod_name}
        suitability_score={result.suitability_score}
        status={ar.status}
      />

      <ReportSummary
        key_ingredients={ar.key_ingredients}
        summary={ar.summary}
      />

      <RiskIngredientList items={ar.risk_ingredients} />

      <RecommendProductList recommendations={recommendations} />

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