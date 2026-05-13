
import './RiskIngredientList.css'

function RiskIngredientList({ items }) {
  return (
    <section className="risk-list">
      <h3 className="risk-list__title">⚠️ 주의 성분</h3>

      {!items || items.length === 0 ? (
        <p className="risk-list__empty">주의할 성분이 없어요! 👍</p>
      ) : (
        <ul className="risk-list__items">
          {items.map((item) => (
            <li key={item.name} className="risk-list__item">
              <strong className="risk-list__name">{item.name}</strong>
              <p className="risk-list__reason">{item.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default RiskIngredientList