exports.analyzeIngredientImage = async (file) => {
  console.log('업로드된 파일 정보:', file);

  return {
    analysis_idx: Date.now(),
    prod_name: '테스트 선크림',
    suitability_score: 82,
    skin_type: '지성',
    result_summary: '지성 피부에 비교적 적합한 제품입니다.',
    ingredients: [
      {
        name: '징크옥사이드',
        type: '무기자차',
        effect: '자외선 차단',
        risk: '낮음',
      },
      {
        name: '티타늄디옥사이드',
        type: '무기자차',
        effect: '자외선 차단',
        risk: '낮음',
      },
    ],
    warnings: [
      '백탁 현상이 있을 수 있습니다.',
      '건성 피부는 보습 제품과 함께 사용하는 것이 좋습니다.',
    ],
    analyzed_at: new Date().toISOString(),
  };
};

exports.getAnalysisHistory = async () => {
  return [
    {
      analysis_idx: 1,
      prod_name: '테스트 선크림 A',
      suitability_score: 82,
      analyzed_at: '2026-05-15T10:00:00.000Z',
    },
    {
      analysis_idx: 2,
      prod_name: '테스트 선크림 B',
      suitability_score: 65,
      analyzed_at: '2026-05-15T11:00:00.000Z',
    },
  ];
};

exports.getAnalysisDetail = async (analysis_idx) => {
  return {
    analysis_idx: Number(analysis_idx),
    prod_name: '테스트 선크림 상세',
    suitability_score: 82,
    skin_type: '지성',
    result_summary: '분석 상세 결과입니다.',
    ingredients: [
      {
        name: '징크옥사이드',
        type: '무기자차',
        effect: '자외선 차단',
        risk: '낮음',
      },
    ],
    warnings: [
      '눈 시림 가능성은 낮습니다.',
      '백탁 현상이 있을 수 있습니다.',
    ],
    analyzed_at: new Date().toISOString(),
  };
};

exports.getRecommendations = async (analysis_idx) => {
  return [
    {
      prod_idx: 1,
      prod_name: '추천 선크림 A',
      reason: `${analysis_idx}번 분석 결과 기준으로 유사 피부 타입에 적합합니다.`,
      suitability_score: 88,
    },
    {
      prod_idx: 2,
      prod_name: '추천 선크림 B',
      reason: '자극 성분이 적고 무기자차 중심 제품입니다.',
      suitability_score: 84,
    },
  ];
};