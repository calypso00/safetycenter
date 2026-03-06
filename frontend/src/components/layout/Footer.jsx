import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  background-color: var(--text-primary);
  color: white;
  padding: 3rem 1rem 1.5rem;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FooterSection = styled.div`
  h4 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: white;
  }
`;

const FooterLink = styled(Link)`
  display: block;
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  transition: var(--transition);
  
  &:hover {
    color: white;
  }
`;

const FooterText = styled.p`
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
`;

const ContactInfo = styled.div`
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.8;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #334155;
  margin: 1.5rem 0;
`;

const Copyright = styled.p`
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  margin: 0;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <h4>안전체험관</h4>
            <FooterText>
              안전체험관은 시민들에게 다양한 안전 교육 프로그램을 제공하여
              안전 의식을 높이고 올바른 대처 능력을 기를 수 있도록 돕습니다.
            </FooterText>
          </FooterSection>
          
          <FooterSection>
            <h4>바로가기</h4>
            <FooterLink to="/">홈</FooterLink>
            <FooterLink to="/programs">프로그램 안내</FooterLink>
            <FooterLink to="/reservation">예약하기</FooterLink>
            <FooterLink to="/board">게시판</FooterLink>
          </FooterSection>
          
          <FooterSection>
            <h4>고객지원</h4>
            <FooterLink to="/board?category=notice">공지사항</FooterLink>
            <FooterLink to="/board?category=faq">자주묻는질문</FooterLink>
            <FooterLink to="/board?category=inquiry">1:1 문의</FooterLink>
          </FooterSection>
          
          <FooterSection>
            <h4>문의안내</h4>
            <ContactInfo>
              📞 대표전화: 02-1234-5678<br />
              🕐 운영시간: 09:00 - 18:00<br />
              📧 이메일: contact@safety-center.kr<br />
              📍 주소: 서울특별시 강남구 테헤란로 123
            </ContactInfo>
          </FooterSection>
        </FooterGrid>
        
        <Divider />
        
        <Copyright>
          © {new Date().getFullYear()} 안전체험관. All rights reserved.
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;