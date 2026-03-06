import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Layout } from '../components/layout';
import { Button, Card, Loading } from '../components/ui';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import programService from '../services/programService';

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
`;

const ProgramCard = styled(Card)`
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
`;

const ProgramImage = styled.div`
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
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

const getProgramIcon = (name) => {
  if (name?.includes('화재') || name?.includes('소방')) return '🔥';
  if (name?.includes('수난') || name?.includes('물')) return '🌊';
  if (name?.includes('교통')) return '🚗';
  if (name?.includes('응급') || name?.includes('심폐')) return '⚡';
  if (name?.includes('지진')) return '🌏';
  if (name?.includes('전기')) return '💡';
  return '🛡️';
};

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await programService.getPrograms();
      if (response.success) {
        setPrograms(response.data || []);
      }
    } catch (error) {
      toast.error('프로그램 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
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
              <ProgramImage>
                {getProgramIcon(program.name)}
              </ProgramImage>
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
      </PageContainer>
    </Layout>
  );
};

export default Programs;