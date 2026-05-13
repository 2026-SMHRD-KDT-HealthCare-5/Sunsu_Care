// src/pages/HistoryDetailPage.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/common/Button'
import ScoreCard from '../components/result/ScoreCard'
import ReportSummary from '../components/result/ReportSummary'
import RiskIngredientList from '../components/result/RiskIngredientList'
import RecommendProductList from '../components/result/RecommendProductList'
import {
  fetchHistoryDetail,
  fetchRecommendations,
} from '../api/analysisApi'
import { formatDateTime } from '../utils/formatDate'
import './HistoryDetailPage.css'

function HistoryDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [result, setResult] = useState(undefined)
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    fetchHistoryDetail(id).then((r) => {
      // 히스토리에는 _full에 전체 데이터가 있을 수 있음
      const full = r?._full || r
      setResult(full || null)
      if (full?.analysis_idx) {
        fetchRecommendations(full.analysis_idx).then(setRecommendations)
      }
    })
  }, [id])

  if (result === undefined) return null

  if (!result) {
    return (
      <div className="page history-empty">
        <div className="history-empty__icon">🔍</div>
        <h1 className="history-empty__title">결과를 찾을 수 없어요</h1>
        <p className="history-empty__desc">
          이미 삭제되었거나 잘못된 링크일 수 있어요.
        </p>
        <Button onClick={() => navigate('/mypage')}>
          마이페이지로 →
        </Button>
      </div>
    )
  }

  const ar = result.analysis_result || {}

  return (
    <div className="page history-detail">
      <div className="history-detail__top">
        <button
          type="button"
          className="history-detail__back"
          onClick={() => navigate('/mypage')}
        >
          ← 히스토리로
        </button>
        <span className="history-detail__date">
          {formatDateTime(result.analyzed_at)}
        </span>
      </div>

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

      <Button size="lg" onClick={() => navigate('/scan')}>
        🔄 다시 분석하기
      </Button>
    </div>
  )
}

export default HistoryDetailPage