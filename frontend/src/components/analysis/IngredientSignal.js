// frontend/src/components/IngredientSignal.js
import React from 'react';
import './IngredientSignal.css';

const IngredientSignal = ({ ingredients }) => {
  // ingredients = { physical: [], chemical: [] }
  return (
    <div className="ingredient-signal">
      <h3>🔍 성분 분석 결과</h3>
      <div className="signal-group">
        <h4>무기자차 성분</h4>
        <ul>
          {ingredients.physical.map((ing, idx) => <li key={idx} className="safe">{ing}</li>)}
        </ul>
      </div>
      <div className="signal-group">
        <h4>유기자차 성분</h4>
        <ul>
          {ingredients.chemical.map((ing, idx) => <li key={idx} className="warning">{ing}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default IngredientSignal;