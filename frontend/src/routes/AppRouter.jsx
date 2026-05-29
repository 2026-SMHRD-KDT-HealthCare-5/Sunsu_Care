// src/routers/AppRouter.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import LogoutPage from '../pages/LogoutPage'
import SignupPage from '../pages/SignupPage'
import ProfilePage from '../pages/ProfilePage'
import ScanPage from '../pages/ScanPage'
import GuidePage from '../pages/GuidePage'
import MyPage from '../pages/MyPage'
import HistoryDetailPage from '../pages/HistoryDetailPage'
import ShoppingPage from '../pages/ShoppingPage'
import AccountSettings from '../pages/AccountSettings'

function AppRouter() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          {/* 🌟 원래대로 MainLayout 안으로 다시 쏙 넣어줍니다! */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/history/:id" element={<HistoryDetailPage />} />
            <Route path="/ShoppingPage" element={<ShoppingPage />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="*" element={<div className="page"><h1>404</h1></div>} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default AppRouter;