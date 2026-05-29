import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import BottomNav from '../components/common/BottomNav';

function MainLayout() {
  const location = useLocation();

  // 🌟 현재 주소가 '/profile'인지 확인
  const isProfilePage = location.pathname === '/profile';

  return (
    <div className="main-layout">
      {/* 1. 프로필 페이지가 아닐 때만 헤더 띄우기 */}
      {!isProfilePage && <Header />}

      <main className="main-layout__content">
        <Outlet />
      </main>

      {/* 2. 프로필 페이지가 아닐 때만 하단바 띄우기 (Footer 제거됨) */}
      {!isProfilePage && <BottomNav />}
    </div>
  );
}

export default MainLayout;