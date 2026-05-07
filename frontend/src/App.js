import React, { useState } from 'react'; // state 사용을 위해 필수
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // 라우팅을 위해 필수

// 여기서부터 기존에 작성하신 import문들을 적으시면 됩니다.
import Main from './pages/Main';
import QuickAnalysis from './pages/QuickAnalysis';
import Survey from './pages/Survey';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AnalysisInput from './pages/AnalysisInput';
import AnalysisResult from './pages/AnalysisResult';
import MyPage from './pages/MyPage';
import Header from './components/Header';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tempSurveyData, setTempSurveyData] = useState(null); // 비로그인 시 작성 데이터 보존용

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/quick-analysis" element={<QuickAnalysis />} />
          
          {/* 설문 페이지: 로그인 여부에 따라 로직이 달라짐 */}
          <Route 
            path="/survey" 
            element={<Survey isLoggedIn={isLoggedIn} tempData={tempSurveyData} setTempData={setTempSurveyData} />} 
          />
          
          {/* 인증 관련 */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />

          {/* 회원 전용 페이지 (Protected Routes) */}
          <Route 
            path="/analysis-input" 
            element={isLoggedIn ? <AnalysisInput /> : <Navigate to="/login" state={{ from: '/analysis-input' }} />} 
          />
          <Route 
            path="/analysis-result" 
            element={isLoggedIn ? <AnalysisResult /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/mypage" 
            element={isLoggedIn ? <MyPage /> : <Navigate to="/login" />} 
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;