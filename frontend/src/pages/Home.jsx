import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Layout } from '../components/layout';
import { Button, Card } from '../components/ui';
import { useAuth } from '../store/AuthContext';
import programService from '../services/programService';
import boardService from '../services/boardService';

const HeroSection = styled.section`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 4rem 1rem;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.125rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Section = styled.section`
  padding: 4rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const SectionSubtitle = styled.p`
  font-size: 1rem;
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
`;

const ProgramGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ProgramCard = styled(Card)`
  cursor: pointer;
`;

const ProgramInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProgramName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const ProgramDescription = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const ProgramMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: 0.5rem;
`;

const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const NoticeItem = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  transition: var(--transition);
  
  &:hover {
    border-color: var(--primary-color);
    background-color: var(--bg-secondary);
  }
`;

const NoticeTitle = styled.span`
  font-size: 0.9375rem;
  color: var(--text-primary);
  font-weight: 500;
`;

const NoticeDate = styled.span`
  font-size: 0.75rem;
  color: var(--text-light);
`;

const FeaturesSection = styled.section`
  background-color: var(--bg-secondary);
  padding: 4rem 1rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 2rem;
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
`;

const Home = () => {
  const [programs, setPrograms] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, noticesRes] = await Promise.all([
          programService.getPrograms({ limit: 3 }),
          boardService.getPosts({ category: 'notice', limit: 5 }),
        ]);
        
        if (programsRes.success) {
          setPrograms(programsRes.data || []);
        }
        if (noticesRes.success) {
          setNotices(noticesRes.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReservationClick = () => {
    if (isAuthenticated) {
      navigate('/reservation');
    } else {
      navigate('/login');
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroTitle>🛡️ 안전체험관에 오신 것을 환영합니다</HeroTitle>
          <HeroSubtitle>
            다양한 안전 교육 프로그램을 통해 안전 의식을 높이고
            <br />
            올바른 대처 능력을 길러보세요.
          </HeroSubtitle>
          <HeroButtons>
            <Button
              variant="secondary"
              size="large"
              onClick={handleReservationClick}
            >
              체험 예약하기
            </Button>
            <Button
              variant="ghost"
              size="large"
              onClick={() => navigate('/programs')}
              style={{ color: 'white', borderColor: 'white' }}
            >
              프로그램 안내
            </Button>
          </HeroButtons>
        </HeroContent>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🔥</FeatureIcon>
            <FeatureTitle>화재 안전 교육</FeatureTitle>
            <FeatureDescription>
              실제 화재 상황을 시뮬레이션하여 대피 요령과 소화기 사용법을 배웁니다.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>🌊</FeatureIcon>
            <FeatureTitle>수난 안전 교육</FeatureTitle>
            <FeatureDescription>
              물놀이 안전 수칙과 익사 예방, 구조 방법을 체험합니다.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>🚗</FeatureIcon>
            <FeatureTitle>교통 안전 교육</FeatureTitle>
            <FeatureDescription>
              교통사고 예방과 올바른 보행 및 운전 습관을 배웁니다.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>⚡</FeatureIcon>
            <FeatureTitle>응급처치 교육</FeatureTitle>
            <FeatureDescription>
              심폐소생술과 기본 응급처치 방법을 실습합니다.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      {/* Programs Section */}
      <Section>
        <SectionTitle>체험 프로그램</SectionTitle>
        <SectionSubtitle>
          다양한 안전 교육 프로그램을 체험해보세요
        </SectionSubtitle>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
        ) : (
          <ProgramGrid>
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                hoverable
                onClick={() => navigate(`/programs/${program.id}`)}
              >
                <ProgramInfo>
                  <ProgramName>{program.name}</ProgramName>
                  <ProgramDescription>
                    {program.description?.substring(0, 100)}
                    {program.description?.length > 100 && '...'}
                  </ProgramDescription>
                  <ProgramMeta>
                    <span>⏱️ {program.duration_minutes}분</span>
                    <span>👥 최대 {program.capacity}명</span>
                    <span>📍 {program.location}</span>
                  </ProgramMeta>
                </ProgramInfo>
              </ProgramCard>
            ))}
          </ProgramGrid>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Button variant="outline" onClick={() => navigate('/programs')}>
            전체 프로그램 보기
          </Button>
        </div>
      </Section>

      {/* Notice Section */}
      <Section style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <SectionTitle>공지사항</SectionTitle>
        <SectionSubtitle>
          안전체험관의 최신 소식을 확인하세요
        </SectionSubtitle>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
        ) : (
          <NoticeList>
            {notices.length > 0 ? (
              notices.map((notice) => (
                <NoticeItem key={notice.id} to={`/board/${notice.id}`}>
                  <NoticeTitle>{notice.title}</NoticeTitle>
                  <NoticeDate>
                    {new Date(notice.created_at).toLocaleDateString()}
                  </NoticeDate>
                </NoticeItem>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                공지사항이 없습니다.
              </div>
            )}
          </NoticeList>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Button variant="outline" onClick={() => navigate('/board?category=notice')}>
            전체 공지사항 보기
          </Button>
        </div>
      </Section>
    </Layout>
  );
};

export default Home;