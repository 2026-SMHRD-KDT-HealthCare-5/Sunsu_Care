import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { fetchHistory } from '../../api/analysisApi';
import './SideMenu.css';

const SideMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isLoggedIn, userNickname, userEmail } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  // 로그인 필요한 경로 이동 (안 됐으면 /login?redirect=경로 로)
  const handleNavWithAuth = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
    }
    onClose();
  };

  // 🌟 분석 히스토리 클릭 → 최신 분석 상세 페이지로 이동
  const handleHistoryClick = async () => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent('/mypage')}`);
      onClose();
      return;
    }

    try {
      const data = await fetchHistory();
      if (data && data.length > 0) {
        const latest = data[0];
        const item = {
          id: latest.analysis_idx,
          name: latest.prod_name || '분석된 제품',
          date: new Date(latest.joined_at).toLocaleDateString(),
          score: latest.match_score ?? 0,
          status: latest.match_status || (latest.match_score >= 75 ? '적합' : '주의'),
          keyIng: latest.key_ingredients ? latest.key_ingredients.split(',') : [],
          warnIng: latest.warn_ingredients ? latest.warn_ingredients.split(',') : []
        };
        navigate(`/history/${item.id}`, { state: { analysisData: item } });
      } else {
        // 분석 이력 없으면 마이페이지로
        navigate('/mypage');
      }
    } catch (err) {
      console.error('[SideMenu] 히스토리 조회 실패:', err);
      navigate('/mypage');
    }
    onClose();
  };

  const profileText = isLoggedIn
    ? (userNickname || userEmail || '사용자')
    : '로그인이 필요합니다';

  const handleProfileClick = () => {
    handleNav(isLoggedIn ? '/mypage' : '/login');
  };

  // 🌟 MIK 디자인: 이니셜 (로그인 시 닉네임 첫 글자, 없으면 'S')
  const userInitial = isLoggedIn && userNickname ? userNickname.charAt(0) : 'S';

  return (
    <>
      <div className={`side-menu ${isOpen ? 'active' : ''}`}>
        <div className="menu-header">
          <div className="user-profile" onClick={handleProfileClick}>
            <div className="user-initial">{userInitial}</div>
            <span className="profile-text">{profileText}</span>
          </div>
          <i className="fa-solid fa-xmark close-icon" onClick={onClose}></i>
        </div>

        <div className="menu-list">
          <div className="menu-group">
            <div className="menu-item" onClick={() => handleNav('/')}>
              <i className="fa-solid fa-house"></i> <span>HOME</span>
            </div>
            <div className="menu-item" onClick={() => handleNavWithAuth('/profile')}>
              <i className="fa-solid fa-wand-magic-sparkles"></i> <span>AI 추천 맞춤케어</span>
            </div>
            <div className="menu-item" onClick={() => handleNavWithAuth('/scan')}>
              <i className="fa-solid fa-magnifying-glass-chart"></i> <span>제품 성분 정밀분석</span>
            </div>
          </div>

          <div className="group-title">MY ACCOUNT</div>
          <div className="menu-group">
            <div className="menu-item" onClick={() => handleNav('/mypage')}>
              <i className="fa-solid fa-user-check"></i> <span>나의 피부 정보</span>
            </div>
            <div className="menu-item" onClick={handleHistoryClick}>
              <i className="fa-solid fa-clock-rotate-left"></i> <span>분석 히스토리</span>
            </div>
            {isLoggedIn && (
              <div className="menu-item" onClick={() => handleNav('/account-settings')}>
                <i className="fa-solid fa-gear"></i> <span>회원 정보 관리</span>
              </div>
            )}
            {isLoggedIn ? (
              <div className="menu-item" onClick={() => handleNav('/logout')}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i> <span>로그아웃</span>
              </div>
            ) : (
              <div className="menu-item" onClick={() => handleNav('/login')}>
                <i className="fa-solid fa-arrow-right-to-bracket"></i> <span>로그인</span>
              </div>
            )}
          </div>

          <div className="group-title">SERVICE</div>
          <div className="menu-group">
            <div className="menu-item" onClick={() => handleNav('/guide')}>
              <i className="fa-solid fa-book-open"></i> <span>피부 관리 가이드</span>
            </div>
            <div className="menu-item" onClick={() => handleNav('/ShoppingPage')}>
              <i className="fa-solid fa-bag-shopping"></i> <span>쇼핑</span>
            </div>
          </div>
        </div>
      </div>
      {/* 바깥 어두운 영역 누르면 닫히게 설정 */}
      <div className={`menu-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
    </>
  );
};

export default SideMenu;
