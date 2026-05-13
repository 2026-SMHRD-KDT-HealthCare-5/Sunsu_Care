// src/components/result/RecommendProductList.jsx
import './RecommendProductList.css'

function RecommendProductList({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null

  return (
    <section className="recommend">
      <h3 className="recommend__title">✨ 추천 제품</h3>
      <ul className="recommend__list">
        {recommendations.map((reco) => (
          <li key={reco.reco_idx} className="recommend__item">
            <p className="recommend__brand">{reco.prod.brand_name}</p>
            <h4 className="recommend__name">{reco.prod.prod_name}</h4>

            <div className="recommend__specs">
              <span className="recommend__chip">{reco.prod.spf_val}</span>
              <span className="recommend__chip">{reco.prod.pa_val}</span>
              <span className="recommend__chip recommend__chip--uv">
                {reco.prod.uv_type}
              </span>
            </div>

            {reco.reco_reason && (
              <p className="recommend__reason">💡 {reco.reco_reason}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default RecommendProductList