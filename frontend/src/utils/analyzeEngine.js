// src/utils/analyzeEngine.js

// 40가지 마스터 기준에 맞춘 성분 자극 분석 맵
const INGREDIENT_WARNING_MAP = {
  '향료': { target: '민감성', desc: '알레르기 유발 고위험 성분입니다.' },
  '벤조페논-3': { target: '민감성', desc: '호르몬 교란 우려가 있는 자차 성분입니다.' },
  '에틸헥실메톡시신나메이트': { target: '눈시림', desc: '눈가 도포 시 눈시림을 유발할 수 있습니다.' },
  '에틸헥실살리실레이트': { target: '눈시림', desc: '화학적 자외선 차단 성분으로 눈가 자극 유발 우려가 있습니다.' },
  '옥토크릴렌': { target: '민감성', desc: '민감성 피부에 미세한 따가움이나 열감을 유발할 수 있습니다.' },
  '에탄올': { target: '건성', desc: '증발 시 피부 속 수분을 뺏어가 장벽을 건조하게 만듭니다.' },
  '메틸메타크릴레이트크로스폴리머': { target: '건성', desc: '과도한 유분을 흡수하여 피부 속건조를 유발할 수 있습니다.' },
  '토코페릴아세테이트': { target: '지성', desc: '지성 피부의 모공을 막아 트러블을 일으킬 가능성이 있습니다.' },
  '에틸헥실팔미테이트': { target: '지성', desc: '모공 차단 지수가 매우 높은 유분 성분입니다.' },
  '페녹시에탄올': { target: '민감성', desc: '방부제 성분으로 극민감성 피부에 자극을 줍니다.' }
};

/**
 * @param {Object} userProfile - { basicType, concern }
 * @param {Object} product - { name, ingredients: [] }
 */
export const calculateSuitability = (userProfile, product) => {
  let score = 100;
  const keyIngredients = [];
  const detectedWarnings = [];

  const userSkinType = userProfile.basicType || "미설정";
  const userConcern = userProfile.concern || "미설정";

  if (!product || !product.ingredients) {
    return { score: 75, status: "적합", keyIngredients: [], warnIngredients: [] };
  }

  product.ingredients.forEach(ingre => {
    // 피부에 유익한 핵심 유효성분 추출 매핑
    if (['나이아신', '나이아신아마이드', '히알루론산', '병풀잎추출물', '판테놀', '세라마이드', '세라마이드엔피', '산화아연', '징크옥사이드', '알란토인'].includes(ingre)) {
      keyIngredients.push(ingre);
    }

    // 주의성분 정밀 대조 및 개인화 매칭 분기
    if (INGREDIENT_WARNING_MAP[ingre]) {
      const warnInfo = INGREDIENT_WARNING_MAP[ingre];
      
      if (warnInfo.target === userSkinType) {
        score -= 15;
        detectedWarnings.push(ingre);
      } else if (warnInfo.target === '눈시림' && userConcern.includes('눈이 시림')) {
        score -= 10;
        detectedWarnings.push(ingre);
      } else if (warnInfo.target === '민감성' && userSkinType === '민감성') {
        score -= 20;
        detectedWarnings.push(ingre);
      }
    }
  });

  score = Math.max(40, Math.min(100, score));

  let status = "적합";
  if (score >= 95) status = "최적";
  else if (score < 75) status = "주의";

  return {
    score,
    status,
    keyIngredients: keyIngredients.slice(0, 2),
    warnIngredients: detectedWarnings
  };
};