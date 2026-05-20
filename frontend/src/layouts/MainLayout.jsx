import { Outlet, useLocation } from 'react-router-dom'; // 🌟 여기에 useLocation을 꼭 불러와야 합니다!
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import BottomNav from '../components/common/BottomNav';

function MainLayout() {
  const location = useLocation();

  // 🌟 현재 주소가 '/profile'인지 확인
  const isProfilePage = location.pathname === '/profile';

  return (
    <div className="main-layout">
      {/* 1. 프로필 페이지가 아닐 때만 헤더 띄우기 */}
      {!isProfilePage && <Header />}
      
      {/* 2. 원래 진님이 쓰시던 클래스 이름으로 원상복구! */}
      <main className="main-layout__content">
        <Outlet />
      </main>
      
      {/* 3. 프로필 페이지가 아닐 때만 푸터와 하단바 띄우기 */}
      {!isProfilePage && <Footer />}
      {!isProfilePage && <BottomNav />}
    </div>
  );
}

export default MainLayout;