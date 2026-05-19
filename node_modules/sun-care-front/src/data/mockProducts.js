// src/data/mockProducts.js
// DB(tb_product) 응답 형태

const mockProducts = [
  {
    prod_idx: 1,
    prod_name: '마일드 미네랄 선크림',
    brand_name: 'SunSafe',
    spf_val: 'SPF50+',
    pa_val: 'PA++++',
    uv_type: '무기자차',
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    prod_idx: 2,
    prod_name: '데일리 톤업 선에센스',
    brand_name: 'PureGlow',
    spf_val: 'SPF50',
    pa_val: 'PA+++',
    uv_type: '혼합',
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    prod_idx: 3,
    prod_name: '워터프루프 액티브 선블록',
    brand_name: 'OceanFit',
    spf_val: 'SPF50+',
    pa_val: 'PA++++',
    uv_type: '유기자차',
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    prod_idx: 4,
    prod_name: '시카 진정 선밤',
    brand_name: 'CalmDerm',
    spf_val: 'SPF50+',
    pa_val: 'PA+++',
    uv_type: '무기자차',
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    prod_idx: 5,
    prod_name: '논 코메도제닉 매트 선크림',
    brand_name: 'ClearSkin',
    spf_val: 'SPF50',
    pa_val: 'PA+++',
    uv_type: '혼합',
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    prod_idx: 6,
    prod_name: '베이비 안심 선스틱',
    brand_name: 'PureBaby',
    spf_val: 'SPF50+',
    pa_val: 'PA++++',
    uv_type: '무기자차',
    created_at: '2026-05-01T00:00:00Z',
  },
]

export default mockProducts

export const findProductByIdx = (prod_idx) =>
  mockProducts.find((p) => p.prod_idx === prod_idx)
