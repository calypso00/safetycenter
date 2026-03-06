import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Layout } from '../../components/layout';
import { Button, Card, Input, Modal, Loading } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';
import adminService from '../../services/adminService';

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

const SearchBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  max-width: 300px;
  padding: 0.625rem 0.875rem;
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
  
  ${({ $active }) => $active 
    ? 'background-color: #dcfce7; color: #166534;' 
    : 'background-color: #fee2e2; color: #991b1b;'}
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${({ $role }) => $role === 'admin' 
    ? 'background-color: #dbeafe; color: #1e40af;' 
    : 'background-color: var(--bg-tertiary); color: var(--text-secondary);'}
`;

const ActionButton = styled.button`
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  border-radius: var(--border-radius);
  margin-right: 0.5rem;
  transition: var(--transition);
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'danger':
        return 'background-color: #fee2e2; color: #991b1b; &:hover { background-color: #fecaca; }';
      case 'success':
        return 'background-color: #dcfce7; color: #166534; &:hover { background-color: #bbf7d0; }';
      default:
        return 'background-color: var(--bg-tertiary); color: var(--text-primary); &:hover { background-color: var(--border-color); }';
    }
  }}
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
  
  &:hover:not(:disabled) {
    background-color: ${({ $active }) => $active ? 'var(--primary-dark)' : 'var(--bg-secondary)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const { isAdmin } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('관리자 권한이 필요합니다.');
      window.location.href = '/';
      return;
    }
    
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({ page, limit: 10, search: searchQuery });
      if (response.success) {
        setUsers(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      const response = await adminService.updateUserStatus(userId, isActive ? 'inactive' : 'active');
      if (response.success) {
        toast.success('사용자 상태가 변경되었습니다.');
        fetchUsers();
      } else {
        toast.error(response.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await adminService.getUserById(userId);
      if (response.success) {
        setSelectedUser(response.data);
        setShowModal(true);
      }
    } catch (error) {
      toast.error('사용자 정보를 불러오는데 실패했습니다.');
    }
  };

  if (loading && users.length === 0) {
    return (
      <Layout hideHeader hideFooter>
        <PageContainer>
          <Sidebar>
            <SidebarTitle>관리자 메뉴</SidebarTitle>
            <SidebarNav>
              <SidebarLink href="/admin">📊 대시보드</SidebarLink>
              <SidebarLink href="/admin/users" $active>👥 사용자 관리</SidebarLink>
              <SidebarLink href="/admin/reservations">📅 예약 관리</SidebarLink>
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
            <SidebarLink href="/admin/users" $active>👥 사용자 관리</SidebarLink>
            <SidebarLink href="/admin/reservations">📅 예약 관리</SidebarLink>
            <SidebarLink href="/admin/programs">🎯 프로그램 관리</SidebarLink>
            <SidebarLink href="/admin/board">📝 게시판 관리</SidebarLink>
            <SidebarLink href="/admin/statistics">📈 통계</SidebarLink>
          </SidebarNav>
        </Sidebar>
        <MainContent>
          <PageHeader>
            <PageTitle>사용자 관리</PageTitle>
          </PageHeader>

          <form onSubmit={handleSearch}>
            <SearchBar>
              <SearchInput
                type="text"
                placeholder="이름, 이메일, 아이디로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="secondary">검색</Button>
            </SearchBar>
          </form>

          <Card>
            <Table>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>아이디</Th>
                  <Th>이름</Th>
                  <Th>이메일</Th>
                  <Th>권한</Th>
                  <Th>상태</Th>
                  <Th>가입일</Th>
                  <Th>작업</Th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <Tr key={user.id}>
                    <Td>{user.id}</Td>
                    <Td>{user.username}</Td>
                    <Td>{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <RoleBadge $role={user.role}>
                        {user.role === 'admin' ? '관리자' : '사용자'}
                      </RoleBadge>
                    </Td>
                    <Td>
                      <StatusBadge $active={user.is_active}>
                        {user.is_active ? '활성' : '비활성'}
                      </StatusBadge>
                    </Td>
                    <Td>{new Date(user.created_at).toLocaleDateString()}</Td>
                    <Td>
                      <ActionButton onClick={() => handleViewUser(user.id)}>
                        상세
                      </ActionButton>
                      <ActionButton
                        $variant={user.is_active ? 'danger' : 'success'}
                        onClick={() => handleStatusChange(user.id, user.is_active)}
                      >
                        {user.is_active ? '비활성화' : '활성화'}
                      </ActionButton>
                    </Td>
                  </Tr>
                ))}
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
        title="사용자 상세 정보"
        size="medium"
      >
        {selectedUser && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>아이디:</strong> {selectedUser.username}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>이름:</strong> {selectedUser.name}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>이메일:</strong> {selectedUser.email}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>연락처:</strong> {selectedUser.phone || '-'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>권한:</strong> {selectedUser.role === 'admin' ? '관리자' : '사용자'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>상태:</strong> {selectedUser.is_active ? '활성' : '비활성'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>가입일:</strong> {new Date(selectedUser.created_at).toLocaleString()}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>예약 수:</strong> {selectedUser.reservation_count || 0}건
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>체험 수:</strong> {selectedUser.experience_count || 0}건
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default UserManagement;