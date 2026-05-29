import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import BottomNav from '../components/common/BottomNav';

function MainLayout() {
  return (
    <div className="main-layout">
      <Header />

      <main className="main-layout__content">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}

export default MainLayout;
