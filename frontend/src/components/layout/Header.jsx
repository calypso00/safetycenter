import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../store/AuthContext';
import Button from '../ui/Button';

const HeaderContainer = styled.header`
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  
  &:hover {
    color: var(--primary-dark);
  }
`;

const LogoIcon = styled.span`
  font-size: 1.5rem;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: var(--transition);
  
  &:hover {
    color: var(--primary-color);
  }
  
  ${({ $active }) => $active && `
    color: var(--primary-color);
  `}
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserName = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <LogoIcon>🛡️</LogoIcon>
          안전체험관
        </Logo>
        
        <Nav>
          <NavLink to="/">홈</NavLink>
          <NavLink to="/programs">프로그램</NavLink>
          <NavLink to="/reservation">예약하기</NavLink>
          <NavLink to="/board">게시판</NavLink>
          {isAuthenticated && (
            <NavLink to="/mypage">마이페이지</NavLink>
          )}
          {isAdmin() && (
            <NavLink to="/admin">관리자</NavLink>
          )}
        </Nav>
        
        <AuthButtons>
          {isAuthenticated ? (
            <UserInfo>
              <UserName>{user?.name}님</UserName>
              <Button variant="secondary" size="small" onClick={handleLogout}>
                로그아웃
              </Button>
            </UserInfo>
          ) : (
            <>
              <Button variant="ghost" size="small" onClick={() => navigate('/login')}>
                로그인
              </Button>
              <Button variant="primary" size="small" onClick={() => navigate('/register')}>
                회원가입
              </Button>
            </>
          )}
        </AuthButtons>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;