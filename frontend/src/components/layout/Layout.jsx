import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Layout = ({ children, hideHeader = false, hideFooter = false }) => {
  return (
    <LayoutContainer>
      {!hideHeader && <Header />}
      <Main>{children}</Main>
      {!hideFooter && <Footer />}
    </LayoutContainer>
  );
};

export default Layout;