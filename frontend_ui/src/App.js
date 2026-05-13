import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import Login from './pages/Login';
import Signup from './pages/Signup'; // 회원가입 추가
import Profile from './pages/Profile';
import History from './pages/History';
import Survey from './pages/Survey';
import Result from './pages/Result';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> {/* 경로 추가 */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </Router>
  );
}

export default App;