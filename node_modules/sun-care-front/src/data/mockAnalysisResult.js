// src/data/mockAnalysisResult.js
// DB(tb_analysis) 응답 형태

// 최신 분석 결과 1건
const mockAnalysisResult = {
  analysis_idx: 1001,
  file_idx: 501,
  model_name: 'yolo-v8-sunscreen-v1',
  prod_code: 'P001',
  prod_name: '테스트 선크림 SPF50+',
  suitability_score: 82,
  analysis_result: {
    status: '적합',
    summary:
      '사용자의 건성·민감 피부에 자극을 줄 수 있는 옥시벤존이 포함되어 있어, 무기자차 기반의 다른 제품을 추천합니다.',
    risk_ingredients: [
      { name: '옥시벤존', reason: '민감성 피부에 자극이 될 수 있음' },
      { name: '향료', reason: '알레르기 반응 가능성' },
    ],
    key_ingredients: [
      { name: '나이아신아마이드', benefit: '미백, 피부 장벽 강화' },
      { name: '히알루론산', benefit: '깊은 보습' },
      { name: '산화아연', benefit: '자외선 차단(무기자차)' },
    ],
  },
  analyzed_at: '2026-05-13T10:30:00Z',
}

export default mockAnalysisResult

// 히스토리 목록 (요약 필드만)
export const mockHistory = [
  {
    analysis_idx: 1001,
    prod_name: '테스트 선크림 SPF50+',
    suitability_score: 82,
    status: '적합',
    analyzed_at: '2026-05-13T10:30:00Z',
  },
  {
    analysis_idx: 1002,
    prod_name: '데일리 글로우 선크림',
    suitability_score: 65,
    status: '주의',
    analyzed_at: '2026-05-08T15:12:00Z',
  },
  {
    analysis_idx: 1003,
    prod_name: '오일프리 선밤',
    suitability_score: 38,
    status: '부적합',
    analyzed_at: '2026-05-01T09:45:00Z',
  },
  {
    analysis_idx: 1004,
    prod_name: '시카 진정 선블록',
    suitability_score: 91,
    status: '적합',
    analyzed_at: '2026-04-22T18:00:00Z',
  },
]

// 추천 제품 (tb_recommendation + tb_product join)
export const mockRecommendations = [
  {
    reco_idx: 1,
    prod_idx: 1,
    prod: {
      prod_idx: 1,
      prod_name: '마일드 미네랄 선크림',
      brand_name: 'SunSafe',
      spf_val: 'SPF50+',
      pa_val: 'PA++++',
      uv_type: '무기자차',
    },
    reco_reason: '건성·민감 피부에 자극이 적은 무기자차 성분 위주.',
    created_at: '2026-05-13T10:30:01Z',
  },
  {
    reco_idx: 2,
    prod_idx: 4,
    prod: {
      prod_idx: 4,
      prod_name: '시카 진정 선밤',
      brand_name: 'CalmDerm',
      spf_val: 'SPF50+',
      pa_val: 'PA+++',
      uv_type: '무기자차',
    },
    reco_reason: '센텔라 성분으로 진정 효과 추가.',
    created_at: '2026-05-13T10:30:02Z',
  },
  {
    reco_idx: 3,
    prod_idx: 6,
    prod: {
      prod_idx: 6,
      prod_name: '베이비 안심 선스틱',
      brand_name: 'PureBaby',
      spf_val: 'SPF50+',
      pa_val: 'PA++++',
      uv_type: '무기자차',
    },
    reco_reason: '저자극 성분만 사용, 휴대 편의성.',
    created_at: '2026-05-13T10:30:03Z',
  },
]

// id로 히스토리 상세 찾기 (지금은 mockAnalysisResult 단일 반환, 추후 확장)
export const findResultByIdx = (idx) => {
  if (idx === mockAnalysisResult.analysis_idx) return mockAnalysisResult
  // 다른 히스토리는 상세 데이터 없음 → null
  return null
}