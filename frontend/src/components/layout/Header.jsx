import { useState } from 'react';
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

  @media (max-width: 768px) {
    display: none;
  }
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

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--text-primary);
  font-size: 1.5rem;
  line-height: 1;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? 'flex' : 'none')};
    flex-direction: column;
    background-color: var(--bg-primary);
    border-top: 1px solid var(--border-color);
    padding: 1rem;
    gap: 0.75rem;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    z-index: 99;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const MobileNavLink = styled(Link)`
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition);

  &:hover {
    color: var(--primary-color);
  }

  &:last-of-type {
    border-bottom: none;
  }
`;

const MobileAuthButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  padding-top: 0.5rem;
`;

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

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

        <HamburgerButton
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="메뉴 열기"
        >
          {menuOpen ? '✕' : '☰'}
        </HamburgerButton>
      </HeaderContent>

      <MobileMenu $open={menuOpen}>
        <MobileNavLink to="/" onClick={closeMenu}>홈</MobileNavLink>
        <MobileNavLink to="/programs" onClick={closeMenu}>프로그램</MobileNavLink>
        <MobileNavLink to="/reservation" onClick={closeMenu}>예약하기</MobileNavLink>
        <MobileNavLink to="/board" onClick={closeMenu}>게시판</MobileNavLink>
        {isAuthenticated && (
          <MobileNavLink to="/mypage" onClick={closeMenu}>마이페이지</MobileNavLink>
        )}
        {isAdmin() && (
          <MobileNavLink to="/admin" onClick={closeMenu}>관리자</MobileNavLink>
        )}
        <MobileAuthButtons>
          {isAuthenticated ? (
            <>
              <UserName>{user?.name}님</UserName>
              <Button variant="secondary" size="small" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="small" onClick={() => { navigate('/login'); closeMenu(); }}>
                로그인
              </Button>
              <Button variant="primary" size="small" onClick={() => { navigate('/register'); closeMenu(); }}>
                회원가입
              </Button>
            </>
          )}
        </MobileAuthButtons>
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header;
