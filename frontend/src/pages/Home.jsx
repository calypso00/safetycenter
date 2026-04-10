import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Layout } from '../components/layout';
import { Button, Card } from '../components/ui';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import programService from '../services/programService';
import boardService from '../services/boardService';

// 썸네일 URL 생성 헬퍼 함수
// nginx(프로덕션)는 /uploads를 백엔드로 프록시, 개발환경은 vite proxy 사용
const getThumbnailUrl = (thumbnailPath) => {
  if (!thumbnailPath) return null;
  // 이미 완전한 URL이면 그대로 반환
  if (thumbnailPath.startsWith('http')) return thumbnailPath;
  // /uploads 경로인 경우: nginx 또는 vite proxy가 처리
  if (thumbnailPath.startsWith('/uploads')) return thumbnailPath;
  // 상대 경로면 그대로 반환
  return thumbnailPath;
};

const getProgramIcon = (name) => {
  if (name?.includes('화재') || name?.includes('소방') || name?.includes('소화기')) return '🔥';
  if (name?.includes('수난') || name?.includes('물')) return '🌊';
  if (name?.includes('교통')) return '🚗';
  if (name?.includes('응급') || name?.includes('심폐')) return '⚡';
  if (name?.includes('지진')) return '🌏';
  if (name?.includes('전기')) return '💡';
  return '🛡️';
};

const HeroSection = styled.section`
  position: relative;
  width: 100%;
  color: white;
  text-align: center;
  background-image: url(/poster.jpg);
  background-position: center top;
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 85vh;
`;

const HeroContent = styled.div`
  width: 100%;
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
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  background-color: #1a2f5e;
  padding: 1.5rem 2rem;
`;

const HeroButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: white;
  color: #333;
  border: none;
  border-radius: 50px;
  padding: 0.85rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 200px;
  justify-content: center;
  
  &:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }

  &::before {
    content: '';
    display: inline-block;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: #ccc;
    flex-shrink: 0;
  }
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

const SliderContainer = styled.div`
  position: relative;
  overflow: hidden;
  margin: 0 -1rem;
  padding: 0 1rem;
`;

const SliderWrapper = styled.div`
  position: relative;
`;

const SliderTrack = styled.div`
  display: flex;
  transition: transform 0.5s ease-in-out;
  transform: translateX(${({ $currentIndex }) => -$currentIndex * 100}%);
`;

const SliderButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--text-primary);
  transition: all 0.2s;
  z-index: 10;
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${({ $position }) => $position === 'left' ? 'left: 0;' : 'right: 0;'}
`;

const SliderDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const SliderDot = styled.button`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--border-color)'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ $active }) => $active ? 'var(--primary-dark)' : 'var(--text-light)'};
  }
`;

const ProgramGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  min-width: 100%;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProgramCard = styled(Card)`
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
`;

const ProgramImageContainer = styled.div`
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  overflow: hidden;
`;

const ProgramImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProgramIcon = styled.div`
  font-size: 4rem;
`;

const ProgramContent = styled.div`
  padding: 1.5rem;
`;

const ProgramName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
`;

const ProgramDescription = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProgramMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-light);
  margin-bottom: 1rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ProgramFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
`;

const ProgramStatus = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${({ $active }) => $active
    ? 'background-color: #dcfce7; color: #166534;'
    : 'background-color: #fee2e2; color: #991b1b;'}
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  justify-content: center;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--border-color)'};
  background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--bg-primary)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-primary)'};
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    border-color: var(--primary-color);
  }
`;

const BoardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BoardItem = styled(Link)`
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

const BoardTitle = styled.span`
  font-size: 0.9375rem;
  color: var(--text-primary);
  font-weight: 500;
`;

const BoardDate = styled.span`
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
  const [faqList, setFaqList] = useState([]);
  const [qnaList, setQnaList] = useState([]);
  const [activeTab, setActiveTab] = useState('notice');
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // 슬라이더 설정
  const ITEMS_PER_SLIDE = 4;
  const AUTO_PLAY_INTERVAL = 5000; // 5초

  // 총 슬라이드 수 계산
  const totalSlides = Math.ceil(programs.length / ITEMS_PER_SLIDE);

  // 현재 탭에 맞는 데이터와 제목 반환
  const getCurrentData = () => {
    switch (activeTab) {
      case 'notice':
        return { items: notices, emptyMessage: '공지사항이 없습니다.' };
      case 'faq':
        return { items: faqList, emptyMessage: 'FAQ가 없습니다.' };
      case 'inquiry':
        return { items: qnaList, emptyMessage: '1:1 문의가 없습니다.' };
      default:
        return { items: [], emptyMessage: '데이터가 없습니다.' };
    }
  };

  const getViewAllLink = () => {
    switch (activeTab) {
      case 'notice':
        return '/board?category=notice';
      case 'faq':
        return '/board?category=faq';
      case 'inquiry':
        return '/board?category=inquiry';
      default:
        return '/board';
    }
  };

  const getViewAllText = () => {
    switch (activeTab) {
      case 'notice':
        return '전체 공지사항 보기';
      case 'faq':
        return '전체 FAQ 보기';
      case 'inquiry':
        return '전체 1:1 문의 보기';
      default:
        return '전체 보기';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, noticesRes, faqRes, qnaRes] = await Promise.all([
          programService.getPrograms({ limit: 12 }),
          boardService.getPosts({ category: 'notice', limit: 5 }),
          boardService.getPosts({ category: 'faq', limit: 5 }),
          boardService.getPosts({ category: 'inquiry', limit: 5 }),
        ]);
        
        if (programsRes.success) {
          setPrograms(programsRes.data || []);
        }
        if (noticesRes.success) {
          setNotices(noticesRes.data || []);
        }
        if (faqRes.success) {
          setFaqList(faqRes.data || []);
        }
        if (qnaRes.success) {
          setQnaList(qnaRes.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 자동 재생 기능
  useEffect(() => {
    if (!autoPlay || programs.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [autoPlay, programs.length, totalSlides]);

  // 슬라이더 조작 시 자동 재생 일시 정지
  const handleSliderInteraction = () => {
    setAutoPlay(false);
    // 10초 후 자동 재생 재개
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const goToSlide = (index) => {
    handleSliderInteraction();
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    handleSliderInteraction();
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    handleSliderInteraction();
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleReservationClick = () => {
    if (isAuthenticated) {
      navigate('/reservation');
    } else {
      navigate('/login');
    }
  };

  const handleReservation = (programId) => {
    if (!isAuthenticated) {
      toast.warning('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    navigate(`/reservation?program=${programId}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroButtons>
            <HeroButton onClick={handleReservationClick}>
              체험 예약하기
            </HeroButton>
            <HeroButton onClick={() => navigate('/programs')}>
              프로그램 소개
            </HeroButton>
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
        ) : programs.length > 0 ? (
          <SliderContainer>
            <SliderWrapper>
              <SliderButton
                $position="left"
                onClick={prevSlide}
                disabled={totalSlides <= 1}
              >
                ◀
              </SliderButton>
              
              <SliderTrack $currentIndex={currentIndex}>
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <ProgramGrid key={slideIndex}>
                    {programs
                      .slice(
                        slideIndex * ITEMS_PER_SLIDE,
                        (slideIndex + 1) * ITEMS_PER_SLIDE
                      )
                      .map((program) => (
                        <ProgramCard
                          key={program.id}
                          hoverable
                          onClick={() => navigate(`/programs/${program.id}`)}
                        >
                          <ProgramImageContainer>
                            {program.thumbnail ? (
                              <ProgramImage
                                src={getThumbnailUrl(program.thumbnail)}
                                alt={program.name}
                                onError={(e) => {
                                  // 이미지 로딩 실패 시 기본 아이콘으로 대체
                                  e.target.onerror = null;
                                  e.target.src = '';
                                  e.target.style.display = 'none';
                                  const iconDiv = document.createElement('div');
                                  iconDiv.style.fontSize = '4rem';
                                  iconDiv.textContent = getProgramIcon(program.name);
                                  e.target.parentNode.appendChild(iconDiv);
                                }}
                              />
                            ) : (
                              <ProgramIcon>{getProgramIcon(program.name)}</ProgramIcon>
                            )}
                          </ProgramImageContainer>
                          <ProgramContent>
                            <ProgramName>{program.name}</ProgramName>
                            <ProgramDescription>{program.description}</ProgramDescription>
                            <ProgramMeta>
                              <MetaItem>⏱️ {program.duration_minutes}분</MetaItem>
                              <MetaItem>👥 최대 {program.capacity}명</MetaItem>
                              <MetaItem>📍 {program.location}</MetaItem>
                            </ProgramMeta>
                            <ProgramFooter>
                              <ProgramStatus $active={program.is_active}>
                                {program.is_active ? '운영중' : '운영중단'}
                              </ProgramStatus>
                              <Button
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReservation(program.id);
                                }}
                                disabled={!program.is_active}
                              >
                                예약하기
                              </Button>
                            </ProgramFooter>
                          </ProgramContent>
                        </ProgramCard>
                      ))}
                  </ProgramGrid>
                ))}
              </SliderTrack>
              
              <SliderButton
                $position="right"
                onClick={nextSlide}
                disabled={totalSlides <= 1}
              >
                ▶
              </SliderButton>
            </SliderWrapper>
            
            {/* 페이지네이션 */}
            {totalSlides > 1 && (
              <SliderDots>
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <SliderDot
                    key={index}
                    $active={index === currentIndex}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </SliderDots>
            )}
          </SliderContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            등록된 프로그램이 없습니다.
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Button variant="outline" onClick={() => navigate('/programs')}>
            전체 프로그램 보기
          </Button>
        </div>
      </Section>

      {/* Board Section with Tabs */}
      <Section style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <SectionTitle>고객센터</SectionTitle>
        <SectionSubtitle>
          궁금한 사항을 확인하세요
        </SectionSubtitle>
        
        <TabContainer>
          <Tab 
            $active={activeTab === 'notice'} 
            onClick={() => setActiveTab('notice')}
          >
            공지사항
          </Tab>
          <Tab 
            $active={activeTab === 'faq'} 
            onClick={() => setActiveTab('faq')}
          >
            FAQ
          </Tab>
          <Tab
            $active={activeTab === 'inquiry'}
            onClick={() => setActiveTab('inquiry')}
          >
            1:1 문의
          </Tab>
        </TabContainer>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
        ) : (
          <BoardList>
            {getCurrentData().items.length > 0 ? (
              getCurrentData().items.map((item) => (
                <BoardItem key={item.id} to={`/board/${item.id}`}>
                  <BoardTitle>{item.title}</BoardTitle>
                  <BoardDate>
                    {new Date(item.created_at).toLocaleDateString()}
                  </BoardDate>
                </BoardItem>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                {getCurrentData().emptyMessage}
              </div>
            )}
          </BoardList>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Button variant="outline" onClick={() => navigate(getViewAllLink())}>
            {getViewAllText()}
          </Button>
        </div>
      </Section>
    </Layout>
  );
};

export default Home;