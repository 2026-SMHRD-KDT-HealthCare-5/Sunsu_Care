import { useParams } from 'react-router-dom'

function HistoryDetailPage() {
  const { id } = useParams()

  return (
    <div className="page">
      <h1>📂 분석 히스토리 상세</h1>
      <p>히스토리 ID: <strong>{id}</strong></p>
    </div>
  )
}
export default HistoryDetailPage