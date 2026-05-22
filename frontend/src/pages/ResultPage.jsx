// frontend/src/pages/ResultPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskStatus, getAnalysisResult } from '../api/analysisApi'; 
import ScoreCard from '../components/result/ScoreCard';
import ReportSummary from '../components/result/ReportSummary';
import RiskIngredientList from '../components/result/RiskIngredientList';
import RecommendProductList from '../components/result/RecommendProductList';
import Button from '../components/common/Button';
import './ResultPage.css';

function ResultPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
    if (!taskId) return;

    let timeoutId;

    const pollStatus = async () => {
      try {
        // 1. 상태 조회
        const data = await getTaskStatus(taskId);
        
        if (data.status === 'completed') {
          // 분석 완료 -> DB에서 결과 가져오기
          const fullResult = await getAnalysisResult(taskId);
          setReport(fullResult.result);
          setLoading(false);
        } else {
          // 분석 중이면 2초 뒤 재시도
          timeoutId = setTimeout(pollStatus, 2000);
        }
      } catch (err) {
        // 404 에러인 경우 -> 아직 분석이 안 끝났거나 FastAPI가 응답 전인 것
        console.warn("FastAPI에서 아직 결과를 찾을 수 없음 (404), 대기 후 재시도...");
        timeoutId = setTimeout(pollStatus, 2000);
      }
    };

    // 1초 뒤에 첫 폴링 시작 (서버가 준비할 시간을 줍니다)
    timeoutId = setTimeout(pollStatus, 1000);

    return () => clearTimeout(timeoutId);
}, [taskId]);

  // 1. 로딩 중 화면
  if (loading) {
    return (
      <div className="page loading">
        <div className="spinner"></div>
        <h1>AI가 성분을 정밀 분석 중입니다...</h1>
        <p>잠시만 기다려주세요.</p>
      </div>
    );
  }

  // 2. 에러 발생 화면
  if (error) {
    return (
      <div className="page error">
        <h1>{error}</h1>
        <Button onClick={() => navigate('/scan')}>제품 스캔 페이지로 이동</Button>
      </div>
    );
  }

  // 3. 데이터가 없는 경우
  if (!report) return <div className="page">분석된 데이터가 없습니다.</div>;

  return (
    <div className="page result">
      <ScoreCard
        prod_name={report.prod_name}
        suitability_score={report.score}
        status={report.status}
      />
      
      <ReportSummary
        key_ingredients={report.key_ingredients}
        summary={report.summary}
      />

      <RiskIngredientList items={report.risk_ingredients} />

      <RecommendProductList recommendations={report.recommendations} />

      <div className="result__actions">
        <Button variant="outline" onClick={() => navigate('/scan')}>
          🔄 재분석
        </Button>
        <Button onClick={() => navigate('/guide')}>
          🧴 세안 가이드
        </Button>
      </div>
    </div>
  );
}

export default ResultPage;