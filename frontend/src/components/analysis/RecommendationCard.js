// frontend/src/components/RecommendationCard.js
import React from 'react';
import './RecommendationCard.css';

const RecommendationCard = ({ product }) => {
  return (
    <div className="recommendation-card">
      <img src={product.image_url} alt={product.name} />
      <div className="card-info">
        <h5>{product.name}</h5>
        <p>{product.reason}</p>
        <a href={product.link} target="_blank" rel="noreferrer">구매하러 가기</a>
      </div>
    </div>
  );
};

export default RecommendationCard;