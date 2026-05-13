
import './ReportSummary.css'

function ReportSummary({ keyIngredients, reason }) {
  return (
    <section className="summary">
      {keyIngredients?.length > 0 && (
        <div>
          <h3 className="summary__title">💎 핵심 성분</h3>
          <ul className="summary__list">
            {keyIngredients.map((item) => (
              <li key={item.name} className="summary__item">
                <strong className="summary__name">{item.name}</strong>
                <span className="summary__benefit">{item.benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reason && (
        <div className="summary__reason">
          <h3 className="summary__title">📝 추천 이유</h3>
          <p className="summary__text">{reason}</p>
        </div>
      )}
    </section>
  )
}

export default ReportSummary