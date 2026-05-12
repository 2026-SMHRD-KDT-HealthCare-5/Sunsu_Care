// src/pages/HomePage.jsx
import { useState } from 'react'

import mockProducts from '../data/mockProducts'
import mockAnalysisResult, { mockHistory } from '../data/mockAnalysisResult'
import mockUserProfile from '../data/mockUserProfile'

import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Loading from '../components/common/Loading'
import Modal from '../components/common/Modal'

function HomePage() {

  console.log('🧪 mockUserProfile:', mockUserProfile)
  console.log('🧪 mockProducts:', mockProducts)
  console.log('🧪 mockAnalysisResult:', mockAnalysisResult)
  console.log('🧪 mockHistory:', mockHistory)
  
  const [name, setName] = useState('')
  const [showLoading, setShowLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="page">
      <h1>🏠 메인 화면 (컴포넌트 데모)</h1>

      <h3 style={{ marginTop: 24 }}>Button</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <Button>기본</Button>
        <Button variant="secondary">보조</Button>
        <Button variant="outline">외곽선</Button>
        <Button disabled>비활성</Button>
      </div>
      <Button size="lg" onClick={() => alert('AI 분석 시작!')}>
        AI 분석하기 (큰 버튼)
      </Button>

      <h3 style={{ marginTop: 32 }}>Input</h3>
      <Input
        label="제품명"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예: 마일드 미네랄 선크림"
      />
      <Input
        label="이메일"
        type="email"
        placeholder="example@suncare.com"
        error="형식이 올바르지 않습니다"
      />

      <h3 style={{ marginTop: 32 }}>Loading & Modal</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button onClick={() => setShowLoading((v) => !v)}>
          로딩 토글
        </Button>
        <Button variant="outline" onClick={() => setShowModal(true)}>
          모달 열기
        </Button>
      </div>

      {showLoading && <Loading message="AI가 분석 중이에요..." />}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="안내"
      >
        분석 결과를 저장하시겠어요?
      </Modal>
    </div>
  )
}

export default HomePage