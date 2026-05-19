// 공통 Input을 감싸서 제품명 입력 전용으로 만든 얇은 wrapper. 
// 나중에 브랜드 입력이나 바코드 스캔 같은 기능을 여기 추가하면 ScanPage는 손대지 않아도 된다.

import Input from '../common/Input'

function ProductInput({ value, onChange, error }) {
  return (
    <Input
      label="제품명"
      placeholder="예: 마일드 미네랄 선크림 SPF50+"
      value={value}
      onChange={onChange}
      error={error}
    />
  )
}

export default ProductInput