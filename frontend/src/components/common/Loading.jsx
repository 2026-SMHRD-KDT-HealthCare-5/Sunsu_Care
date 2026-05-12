
import './Loading.css'

function Loading({ message = '로딩 중...' }) {
  return (
    <div className="loading">
      <div className="loading__spinner" />
      <p className="loading__message">{message}</p>
    </div>
  )
}

export default Loading