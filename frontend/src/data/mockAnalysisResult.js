
// 최신 분석 결과 1건
const mockAnalysisResult = {
  id: 'r001',
  productName: '테스트 선크림 SPF50+',
  brand: 'TestBrand',
  productImage: 'https://placehold.co/300x300/FFE8D6/E5621A?text=Product',
  score: 82,                       // 0~100
  status: '적합',                  // '적합' | '주의' | '부적합'
  riskIngredients: [
    { name: '옥시벤존', reason: '민감성 피부에 자극이 될 수 있음' },
    { name: '향료', reason: '알레르기 반응 가능성' },
  ],
  keyIngredients: [
    { name: '나이아신아마이드', benefit: '미백, 피부 장벽 강화' },
    { name: '히알루론산', benefit: '깊은 보습' },
    { name: '산화아연', benefit: '자외선 차단(무기자차)' },
  ],
  recommendations: ['p001', 'p004', 'p006'],   // mockProducts의 id 참조
  reason:
    '사용자의 건성·민감 피부에 자극을 줄 수 있는 옥시벤존이 포함되어 있어, 무기자차 기반의 다른 제품을 추천드려요.',
  createdAt: '2026-05-12T10:30:00',
}

export default mockAnalysisResult

// 과거 분석 히스토리 (마이페이지 리스트 용)
export const mockHistory = [
  {
    id: 'r001',
    productName: '테스트 선크림 SPF50+',
    score: 82,
    status: '적합',
    createdAt: '2026-05-12T10:30:00',
  },
  {
    id: 'r002',
    productName: '데일리 글로우 선크림',
    score: 65,
    status: '주의',
    createdAt: '2026-05-08T15:12:00',
  },
  {
    id: 'r003',
    productName: '오일프리 선밤',
    score: 38,
    status: '부적합',
    createdAt: '2026-05-01T09:45:00',
  },
  {
    id: 'r004',
    productName: '시카 진정 선블록',
    score: 91,
    status: '적합',
    createdAt: '2026-04-22T18:00:00',
  },
]

// id로 분석 결과 찾기 (히스토리 상세에서 사용)
export const findResultById = (id) => {
  const list = [mockAnalysisResult, ...mockHistory]
  return list.find((r) => r.id === id) || null
}

// recommendations에 제품 id만 넣어둔 이유: 백엔드 응답도 보통 참조 ID만 주고 실제 데이터는 따로 조회. 그 패턴에 미리 맞춰둠.