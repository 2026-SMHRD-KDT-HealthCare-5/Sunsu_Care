
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/common/Button'
import ScoreCard from '../components/result/ScoreCard'
import ReportSummary from '../components/result/ReportSummary'
import RiskIngredientList from '../components/result/RiskIngredientList'
import RecommendProductList from '../components/result/RecommendProductList'
import { findHistoryById } from '../utils/storage'
import { formatDateTime } from '../utils/formatDate'
import './HistoryDetailPage.css'

function HistoryDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [result, setResult] = useState(undefined)

  useEffect(() => {
    setResult(findHistoryById(id))
  }, [id])

  // 로딩 중
  if (result === undefined) return null

  // 결과 없음
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
          {formatDateTime(result.createdAt)}
        </span>
      </div>

      <ScoreCard result={result} />
      <ReportSummary
        keyIngredients={result.keyIngredients}
        reason={result.reason}
      />
      <RiskIngredientList items={result.riskIngredients} />
      <RecommendProductList productIds={result.recommendations} />

      <Button size="lg" onClick={() => navigate('/scan')}>
        🔄 다시 분석하기
      </Button>
    </div>
  )
}

export default HistoryDetailPage