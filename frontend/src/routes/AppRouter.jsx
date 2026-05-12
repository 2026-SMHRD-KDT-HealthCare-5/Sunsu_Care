
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MainLayout from '../layouts/MainLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import ProfilePage from '../pages/ProfilePage'
import ScanPage from '../pages/ScanPage'
import ResultPage from '../pages/ResultPage'
import GuidePage from '../pages/GuidePage'
import MyPage from '../pages/MyPage'
import HistoryDetailPage from '../pages/HistoryDetailPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/history/:id" element={<HistoryDetailPage />} />
            <Route
              path="*"
              element={
                <div className="page">
                  <h1>404</h1>
                  <p>페이지를 찾을 수 없어요.</p>
                </div>
              }
            />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default AppRouter