
import { findProductById } from '../../data/mockProducts'
import './RecommendProductList.css'

function RecommendProductList({ productIds }) {
  // id 배열 → 실제 제품 객체 배열로 변환
  const products = (productIds || [])
    .map((id) => findProductById(id))
    .filter(Boolean) // 못 찾은 id 제거

  if (products.length === 0) return null

  return (
    <section className="recommend">
      <h3 className="recommend__title">✨ 추천 제품</h3>
      <ul className="recommend__list">
        {products.map((product) => (
          <li key={product.id} className="recommend__item">
            <img
              src={product.image}
              alt={product.name}
              className="recommend__image"
            />
            <div className="recommend__info">
              <p className="recommend__brand">{product.brand}</p>
              <h4 className="recommend__name">{product.name}</h4>
              <p className="recommend__price">
                {product.price.toLocaleString()}원
              </p>
              <a
                href={product.shopUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="recommend__link"
              >
                쇼핑몰로 이동 →
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default RecommendProductList