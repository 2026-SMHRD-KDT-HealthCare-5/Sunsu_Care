
const mockProducts = [
  {
    id: 'p001',
    name: '마일드 미네랄 선크림 SPF50+',
    brand: 'SunSafe',
    type: '무기자차',
    price: 24000,
    image: 'https://placehold.co/200x200/FFE8D6/E5621A?text=SunSafe',
    shopUrl: 'https://example.com/product/p001',
    keyIngredients: ['산화아연', '히알루론산', '나이아신아마이드'],
    suitableFor: ['건성', '민감성'],
  },
  {
    id: 'p002',
    name: '데일리 톤업 선에센스 SPF50',
    brand: 'PureGlow',
    type: '혼합',
    price: 19800,
    image: 'https://placehold.co/200x200/FFE8D6/E5621A?text=PureGlow',
    shopUrl: 'https://example.com/product/p002',
    keyIngredients: ['이산화티탄', '센텔라', '판테놀'],
    suitableFor: ['복합성', '건성'],
  },
  {
    id: 'p003',
    name: '워터프루프 액티브 선블록 SPF50+',
    brand: 'OceanFit',
    type: '유기자차',
    price: 16500,
    image: 'https://placehold.co/200x200/FFE8D6/E5621A?text=OceanFit',
    shopUrl: 'https://example.com/product/p003',
    keyIngredients: ['옥토크릴렌', '비사보롤'],
    suitableFor: ['지성', '중성'],
  },
  {
    id: 'p004',
    name: '시카 진정 선밤 SPF50+',
    brand: 'CalmDerm',
    type: '무기자차',
    price: 28000,
    image: 'https://placehold.co/200x200/FFE8D6/E5621A?text=CalmDerm',
    shopUrl: 'https://example.com/product/p004',
    keyIngredients: ['산화아연', '센텔라아시아티카', '판테놀'],
    suitableFor: ['민감성', '건성'],
  },
  {
    id: 'p005',
    name: '논 코메도제닉 매트 선크림 SPF50',
    brand: 'ClearSkin',
    type: '혼합',
    price: 22000,
    image: 'https://placehold.co/200x200/FFE8D6/E5621A?text=ClearSkin',
    shopUrl: 'https://example.com/product/p005',
    keyIngredients: ['살리실산', '나이아신아마이드'],
    suitableFor: ['지성', '복합성'],
  },
  {
    id: 'p006',
    name: '베이비 안심 선스틱 SPF50+',
    brand: 'PureBaby',
    type: '무기자차',
    price: 18000,
    image: 'https://placehold.co/200x200/FFE8D6/E5621A?text=PureBaby',
    shopUrl: 'https://example.com/product/p006',
    keyIngredients: ['산화아연', '시어버터'],
    suitableFor: ['민감성', '건성', '중성'],
  },
]

export default mockProducts

// id로 제품 찾기 헬퍼
export const findProductById = (id) =>
  mockProducts.find((p) => p.id === id)