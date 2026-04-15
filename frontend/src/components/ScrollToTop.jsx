import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 라우트 변경 시 페이지 상단으로 스크롤을 이동시키는 컴포넌트
 * React Router v6의 BrowserRouter는 기본적으로 스크롤 위치를 복원하지 않으므로
 * 이 컴포넌트를 Router 내부에 배치하여 모든 페이지 이동 시 스크롤을 최상단으로 이동시킵니다.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
