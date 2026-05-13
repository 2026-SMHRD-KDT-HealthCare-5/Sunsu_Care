
import './ScoreCard.css'

function getStatusClass(status) {
  if (status === '적합') return 'is-success'
  if (status === '주의') return 'is-warning'
  return 'is-danger'
}

function ScoreCard({ result }) {
  const statusClass = getStatusClass(result.status)

  return (
    <div className={`score-card ${statusClass}`}>
      {result.productImage && (
        <img
          src={result.productImage}
          alt={result.productName}
          className="score-card__image"
        />
      )}

      <h2 className="score-card__name">{result.productName}</h2>
      {result.brand && <p className="score-card__brand">{result.brand}</p>}

      <div className="score-card__score">
        <span className="score-card__number">{result.score}</span>
        <span className="score-card__total">/ 100</span>
      </div>

      <span className="score-card__badge">{result.status}</span>
    </div>
  )
}

export default ScoreCard