// src/components/result/ReportSummary.jsx
import './ReportSummary.css'

function ReportSummary({ key_ingredients, summary }) {
  return (
    <section className="summary">
      {key_ingredients?.length > 0 && (
        <div>
          <h3 className="summary__title">💎 핵심 성분</h3>
          <ul className="summary__list">
            {key_ingredients.map((item) => (
              <li key={item.name} className="summary__item">
                <strong className="summary__name">{item.name}</strong>
                <span className="summary__benefit">{item.benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary && (
        <div className="summary__reason">
          <h3 className="summary__title">📝 추천 이유</h3>
          <p className="summary__text">{summary}</p>
        </div>
      )}
    </section>
  )
}

export default ReportSummary