import { useNavigate, Link } from 'react-router-dom';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', padding: '10px' }}>
      <Link to="/" style={{ fontWeight: 'bold', fontSize: '20px' }}>SUNSU_CARE</Link>
      <div>
        {!isLoggedIn ? (
          <button onClick={() => navigate('/login')}>로그인</button>
        ) : (
          <>
            <button onClick={() => navigate('/mypage')}>마이페이지</button>
            <button onClick={() => setIsLoggedIn(false)}>로그아웃</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;