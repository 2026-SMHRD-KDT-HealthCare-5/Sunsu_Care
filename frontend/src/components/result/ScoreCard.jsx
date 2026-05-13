// src/components/result/ScoreCard.jsx
import './ScoreCard.css'

function getStatusClass(status) {
  if (status === '적합') return 'is-success'
  if (status === '주의') return 'is-warning'
  return 'is-danger'
}

function ScoreCard({ prod_name, brand_name, suitability_score, status }) {
  const statusClass = getStatusClass(status)

  return (
    <div className={`score-card ${statusClass}`}>
      <h2 className="score-card__name">{prod_name}</h2>
      {brand_name && <p className="score-card__brand">{brand_name}</p>}

      <div className="score-card__score">
        <span className="score-card__number">{suitability_score}</span>
        <span className="score-card__total">/ 100</span>
      </div>

      <span className="score-card__badge">{status}</span>
    </div>
  )
}

export default ScoreCard