import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Layout } from '../components/layout';
import { Button, Card, Loading } from '../components/ui';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import programService from '../services/programService';

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

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const ProgramGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  min-height: 600px;
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

// 페이지네이션 스타일
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 3rem;
  padding: 1rem 0;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 0.75rem;
  border: 1px solid ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: var(--border-radius);
  background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'white'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-primary)'};
  font-size: 0.875rem;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? '0.5' : '1'};
  transition: var(--transition);

  &:hover:not(:disabled) {
    background-color: ${({ $active }) => $active ? 'var(--primary-dark)' : 'var(--background-color)'};
    border-color: var(--primary-color);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const PageInfo = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 1rem;
`;

const getProgramIcon = (name) => {
  if (name?.includes('화재') || name?.includes('소방') || name?.includes('소화기')) return '🔥';
  if (name?.includes('수난') || name?.includes('물')) return '🌊';
  if (name?.includes('교통')) return '🚗';
  if (name?.includes('응급') || name?.includes('심폐')) return '⚡';
  if (name?.includes('지진')) return '🌏';
  if (name?.includes('전기')) return '💡';
  return '🛡️';
};

const ITEMS_PER_PAGE = 9;

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrograms(currentPage);
  }, [currentPage]);

  const fetchPrograms = async (page) => {
    try {
      setLoading(true);
      const response = await programService.getPrograms({
        page,
        limit: ITEMS_PER_PAGE
      });
      if (response.success) {
        setPrograms(response.data || []);
        // 페이지네이션 정보 설정
        const pagination = response.pagination;
        if (pagination) {
          setCurrentPage(pagination.page);
          setTotalPages(pagination.totalPages);
          setTotalItems(pagination.total);
        }
      }
    } catch (error) {
      toast.error('프로그램 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReservation = (programId) => {
    if (!isAuthenticated) {
      toast.warning('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    navigate(`/reservation?program=${programId}`);
  };

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <Loading fullScreen text="프로그램을 불러오는 중..." />
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <PageTitle>체험 프로그램 안내</PageTitle>
        </PageHeader>

        <ProgramGrid>
          {programs.map((program) => (
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

        {programs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            등록된 프로그램이 없습니다.
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <PaginationContainer>
            <PageButton
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              $disabled={currentPage === 1}
            >
              {'<<'}
            </PageButton>
            <PageButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              $disabled={currentPage === 1}
            >
              {'<'}
            </PageButton>

            {getPageNumbers().map((page) => (
              <PageButton
                key={page}
                $active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </PageButton>
            ))}

            <PageButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              $disabled={currentPage === totalPages}
            >
              {'>'}
            </PageButton>
            <PageButton
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              $disabled={currentPage === totalPages}
            >
              {'>>'}
            </PageButton>
          </PaginationContainer>
        )}

        {totalItems > 0 && (
          <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            총 {totalItems}개 프로그램 | {currentPage} / {totalPages} 페이지
          </div>
        )}
      </PageContainer>
    </Layout>
  );
};

export default Programs;
