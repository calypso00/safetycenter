import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Layout } from '../../components/layout';
import { Button, Card, Loading, Modal } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';
import adminService from '../../services/adminService';
import programService from '../../services/programService';

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.aside`
  width: 250px;
  background-color: var(--text-primary);
  color: white;
  padding: 1.5rem 0;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const SidebarTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
`;

const SidebarLink = styled.a`
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  color: ${({ $active }) => $active ? 'white' : '#94a3b8'};
  background-color: ${({ $active }) => $active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border-left: 3px solid ${({ $active }) => $active ? 'var(--primary-color)' : 'transparent'};
  transition: var(--transition);
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  background-color: var(--bg-secondary);
  overflow-y: auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const DateInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  overflow: hidden;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
`;

const Td = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
`;

const Tr = styled.tr`
  &:hover {
    background-color: var(--bg-secondary);
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${({ $status }) => {
    switch ($status) {
      case 'pending':
        return 'background-color: #fef3c7; color: #92400e;';
      case 'confirmed':
        return 'background-color: #dcfce7; color: #166534;';
      case 'cancelled':
        return 'background-color: #fee2e2; color: #991b1b;';
      case 'completed':
        return 'background-color: #dbeafe; color: #1e40af;';
      default:
        return 'background-color: var(--bg-tertiary); color: var(--text-secondary);';
    }
  }}
`;

const ActionButton = styled.button`
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  border-radius: var(--border-radius);
  transition: var(--transition);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: var(--border-color);
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--bg-primary)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-primary)'};
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background-color: ${({ $active }) => $active ? 'var(--primary-dark)' : 'var(--bg-secondary)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
`;

const ModalContent = styled.div`
  display: grid;
  gap: 1rem;
`;

const ModalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ModalLabel = styled.span`
  font-weight: 600;
  color: var(--text-secondary);
`;

const ModalValue = styled.span`
  color: var(--text-primary);
`;

const statusLabels = {
  pending: '대기중',
  confirmed: '확정',
  cancelled: '취소됨',
  completed: '완료'
};

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // 필터 상태
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  
  const { isAdmin } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('관리자 권한이 필요합니다.');
      window.location.href = '/';
      return;
    }
    
    fetchPrograms();
    fetchReservations();
  }, [page]);

  const fetchPrograms = async () => {
    try {
      const response = await programService.getAllPrograms();
      if (response.success) {
        setPrograms(response.data || []);
      }
    } catch (error) {
      console.error('프로그램 목록 조회 실패:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
        ...(dateFilter && { date: dateFilter }),
        ...(programFilter && { programId: programFilter })
      };
      
      const response = await adminService.getAllReservations(params);
      if (response.success) {
        setReservations(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error('예약 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    setPage(1);
    fetchReservations();
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setProgramFilter('');
    setPage(1);
    setTimeout(() => fetchReservations(), 0);
  };

  const handleViewDetail = (reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && reservations.length === 0) {
    return (
      <Layout hideHeader hideFooter>
        <PageContainer>
          <Sidebar>
            <SidebarTitle>관리자 메뉴</SidebarTitle>
            <SidebarNav>
              <SidebarLink href="/admin">📊 대시보드</SidebarLink>
              <SidebarLink href="/admin/users">👥 사용자 관리</SidebarLink>
              <SidebarLink href="/admin/reservations" $active>📅 예약 관리</SidebarLink>
              <SidebarLink href="/admin/programs">🎯 프로그램 관리</SidebarLink>
              <SidebarLink href="/admin/board">📝 게시판 관리</SidebarLink>
              <SidebarLink href="/admin/statistics">📈 통계</SidebarLink>
            </SidebarNav>
          </Sidebar>
          <MainContent>
            <Loading fullScreen text="데이터를 불러오는 중..." />
          </MainContent>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout hideHeader hideFooter>
      <PageContainer>
        <Sidebar>
          <SidebarTitle>관리자 메뉴</SidebarTitle>
          <SidebarNav>
            <SidebarLink href="/admin">📊 대시보드</SidebarLink>
            <SidebarLink href="/admin/users">👥 사용자 관리</SidebarLink>
            <SidebarLink href="/admin/reservations" $active>📅 예약 관리</SidebarLink>
            <SidebarLink href="/admin/programs">🎯 프로그램 관리</SidebarLink>
            <SidebarLink href="/admin/board">📝 게시판 관리</SidebarLink>
            <SidebarLink href="/admin/statistics">📈 통계</SidebarLink>
          </SidebarNav>
        </Sidebar>
        <MainContent>
          <PageHeader>
            <PageTitle>예약 관리</PageTitle>
          </PageHeader>

          <FilterBar>
            <FilterGroup>
              <FilterLabel>상태:</FilterLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">전체</option>
                <option value="pending">대기중</option>
                <option value="confirmed">확정</option>
                <option value="cancelled">취소됨</option>
                <option value="completed">완료</option>
              </Select>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>날짜:</FilterLabel>
              <DateInput
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>프로그램:</FilterLabel>
              <Select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
              >
                <option value="">전체</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup style={{ marginLeft: 'auto' }}>
              <Button variant="secondary" size="small" onClick={handleFilterChange}>
                적용
              </Button>
              <Button variant="ghost" size="small" onClick={handleResetFilters}>
                초기화
              </Button>
            </FilterGroup>
          </FilterBar>

          <Card>
            <Table>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>예약자</Th>
                  <Th>프로그램</Th>
                  <Th>예약일</Th>
                  <Th>시간대</Th>
                  <Th>인원</Th>
                  <Th>상태</Th>
                  <Th>예약신청일</Th>
                  <Th>작업</Th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr>
                    <Td colSpan="9">
                      <EmptyState>예약 내역이 없습니다.</EmptyState>
                    </Td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <Tr key={reservation.id}>
                      <Td>{reservation.id}</Td>
                      <Td>
                        <div>{reservation.user_name || reservation.username}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {reservation.email}
                        </div>
                      </Td>
                      <Td>{reservation.program_name}</Td>
                      <Td>{formatDate(reservation.reservation_date)}</Td>
                      <Td>{reservation.time_slot}</Td>
                      <Td>{reservation.participant_count}명</Td>
                      <Td>
                        <StatusBadge $status={reservation.status}>
                          {statusLabels[reservation.status] || reservation.status}
                        </StatusBadge>
                      </Td>
                      <Td>{formatDate(reservation.created_at)}</Td>
                      <Td>
                        <ActionButton onClick={() => handleViewDetail(reservation)}>
                          상세보기
                        </ActionButton>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>

          {totalPages > 1 && (
            <Pagination>
              <PageButton disabled={page === 1} onClick={() => setPage(page - 1)}>
                이전
              </PageButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <PageButton key={p} $active={p === page} onClick={() => setPage(p)}>
                    {p}
                  </PageButton>
                ))}
              <PageButton disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                다음
              </PageButton>
            </Pagination>
          )}
        </MainContent>
      </PageContainer>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="예약 상세 정보"
        size="medium"
        footer={
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            닫기
          </Button>
        }
      >
        {selectedReservation && (
          <ModalContent>
            <ModalRow>
              <ModalLabel>예약 ID</ModalLabel>
              <ModalValue>{selectedReservation.id}</ModalValue>
            </ModalRow>
            <ModalRow>
              <ModalLabel>예약자</ModalLabel>
              <ModalValue>{selectedReservation.user_name || selectedReservation.username}</ModalValue>
            </ModalRow>
            <ModalRow>
              <ModalLabel>이메일</ModalLabel>
              <ModalValue>{selectedReservation.email || '-'}</ModalValue>
            </ModalRow>
            <ModalRow>
              <ModalLabel>연락처</ModalLabel>
              <ModalValue>{selectedReservation.phone || '-'}</ModalValue>
            </ModalRow>
            <ModalRow>
              <ModalLabel>프로그램</ModalLabel>
              <ModalValue>{selectedReservation.program_name}</ModalValue>
            </ModalRow>
            <ModalRow>
              <ModalLabel>위치</ModalLabel>
              <ModalValue>{selectedReservation.location || '-'}</ModalValue>
            </ModalRow>
            <ModalRow>
              <ModalLabel>예약일</ModalLabel>
              <ModalValue>{formatDate(selectedReservation.reservation_date)}</ModalValue>
            </ModalRow>
            <ModalRow>
              <ModalLabel>시간대</ModalLabel>
              <ModalValue>{selectedReservation.time_slot}</ModalValue>
            </ModalRow>
            <ModalRow>
              <ModalLabel>참여 인원</ModalLabel>
              <ModalValue>{selectedReservation.participant_count}명</ModalValue>
            </ModalRow>
            <ModalRow>
              <ModalLabel>상태</ModalLabel>
              <ModalValue>
                <StatusBadge $status={selectedReservation.status}>
                  {statusLabels[selectedReservation.status] || selectedReservation.status}
                </StatusBadge>
              </ModalValue>
            </ModalRow>
            <ModalRow>
              <ModalLabel>예약 신청일</ModalLabel>
              <ModalValue>{formatDateTime(selectedReservation.created_at)}</ModalValue>
            </ModalRow>
          </ModalContent>
        )}
      </Modal>
    </Layout>
  );
};

export default ReservationManagement;
