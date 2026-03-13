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
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  
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

  const handleRegisterUser = async (userData) => {
    try {
      const response = await adminService.createUser(userData);
      if (response.success) {
        toast.success('사용자가 성공적으로 등록되었습니다.');
        setShowRegisterModal(false);
        fetchUsers();
      } else {
        toast.error(response.message || '사용자 등록에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || '사용자 등록에 실패했습니다.');
    }
  };

  const handleBulkRegister = async (users) => {
    try {
      const response = await adminService.createBulkUsers(users);
      if (response.success) {
        const { success_count, failed_count } = response.data;
        if (failed_count > 0) {
          toast.warning(`${success_count}명 등록 성공, ${failed_count}명 등록 실패`);
        } else {
          toast.success(`${success_count}명의 사용자가 성공적으로 등록되었습니다.`);
        }
        setShowBulkModal(false);
        fetchUsers();
      } else {
        toast.error(response.message || '단체 등록에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || '단체 등록에 실패했습니다.');
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button onClick={() => setShowBulkModal(true)} variant="secondary">
                단체 등록
              </Button>
              <Button onClick={() => setShowRegisterModal(true)}>
                단일 등록
              </Button>
            </div>
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
        {selectedUser && selectedUser.user && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>아이디:</strong> {selectedUser.user.username}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>이름:</strong> {selectedUser.user.name}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>이메일:</strong> {selectedUser.user.email}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>연락처:</strong> {selectedUser.user.phone || '-'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>권한:</strong> {selectedUser.user.role === 'admin' ? '관리자' : '사용자'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>상태:</strong> {selectedUser.user.is_active ? '활성' : '비활성'}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>가입일:</strong> {new Date(selectedUser.user.created_at).toLocaleString()}
            </div>
            {selectedUser.recent_reservations && selectedUser.recent_reservations.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>최근 예약:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {selectedUser.recent_reservations.map(res => (
                    <li key={res.id}>
                      {res.program_name} - {res.reservation_date} ({res.status})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedUser.recent_experiences && selectedUser.recent_experiences.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>최근 체험:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {selectedUser.recent_experiences.map(exp => (
                    <li key={exp.id}>
                      {exp.program_name} - {exp.entry_time}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 단일 회원 등록 모달 */}
      <RegisterUserModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSubmit={handleRegisterUser}
      />

      {/* 단체 회원 등록 모달 */}
      <BulkRegisterModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSubmit={handleBulkRegister}
      />
    </Layout>
  );
};

export default UserManagement;

// 단일 회원 등록 모달
const RegisterUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 입력 검증
    if (!formData.username || !formData.password || !formData.name || !formData.email) {
      toast.error('아이디, 비밀번호, 이름, 이메일은 필수 입력 항목입니다.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
        role: 'user'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      role: 'user'
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="단일 회원 등록" size="medium">
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>아이디 *</Label>
          <Input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="사용할 아이디를 입력하세요"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>비밀번호 *</Label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>이름 *</Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름을 입력하세요"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>이메일 *</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>연락처</Label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="연락처를 입력하세요 (예: 010-1234-5678)"
          />
        </FormGroup>
        <FormGroup>
          <Label>권한</Label>
          <Select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">사용자</option>
            <option value="admin">관리자</option>
          </Select>
        </FormGroup>
        <ButtonGroup>
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '등록 중...' : '등록'}
          </Button>
        </ButtonGroup>
      </form>
    </Modal>
  );
};

// 단체 회원 등록 모달
const BulkRegisterModal = ({ isOpen, onClose, onSubmit }) => {
  const [users, setUsers] = useState([
    { username: '', password: '', name: '', email: '', phone: '', role: 'user' }
  ]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (index, field, value) => {
    const newUsers = [...users];
    newUsers[index][field] = value;
    setUsers(newUsers);
  };

  const addUserRow = () => {
    if (users.length >= 100) {
      toast.warning('최대 100명까지 등록 가능합니다.');
      return;
    }
    setUsers([...users, { username: '', password: '', name: '', email: '', phone: '', role: 'user' }]);
  };

  const removeUserRow = (index) => {
    if (users.length === 1) {
      toast.warning('최소 1명 이상의 회원이 필요합니다.');
      return;
    }
    const newUsers = users.filter((_, i) => i !== index);
    setUsers(newUsers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 입력 검증
    const invalidUsers = users.filter(u => !u.username || !u.password || !u.name || !u.email);
    if (invalidUsers.length > 0) {
      toast.error('아이디, 비밀번호, 이름, 이메일은 필수 입력 항목입니다.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(users);
      setUsers([{ username: '', password: '', name: '', email: '', phone: '', role: 'user' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsers([{ username: '', password: '', name: '', email: '', phone: '', role: 'user' }]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="단체 회원 등록" size="large">
      <InfoText>
        한 번에 최대 100명까지 등록 가능합니다. 아이디, 비밀번호, 이름, 이메일은 필수 입력 항목입니다.
      </InfoText>
      <form onSubmit={handleSubmit}>
        <BulkTable>
          <thead>
            <tr>
              <BulkTh>아이디 *</BulkTh>
              <BulkTh>비밀번호 *</BulkTh>
              <BulkTh>이름 *</BulkTh>
              <BulkTh>이메일 *</BulkTh>
              <BulkTh>연락처</BulkTh>
              <BulkTh>권한</BulkTh>
              <BulkTh></BulkTh>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <BulkTd>
                  <BulkInput
                    type="text"
                    value={user.username}
                    onChange={(e) => handleChange(index, 'username', e.target.value)}
                    placeholder="아이디"
                  />
                </BulkTd>
                <BulkTd>
                  <BulkInput
                    type="password"
                    value={user.password}
                    onChange={(e) => handleChange(index, 'password', e.target.value)}
                    placeholder="비밀번호"
                  />
                </BulkTd>
                <BulkTd>
                  <BulkInput
                    type="text"
                    value={user.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    placeholder="이름"
                  />
                </BulkTd>
                <BulkTd>
                  <BulkInput
                    type="email"
                    value={user.email}
                    onChange={(e) => handleChange(index, 'email', e.target.value)}
                    placeholder="이메일"
                  />
                </BulkTd>
                <BulkTd>
                  <BulkInput
                    type="tel"
                    value={user.phone}
                    onChange={(e) => handleChange(index, 'phone', e.target.value)}
                    placeholder="연락처"
                  />
                </BulkTd>
                <BulkTd>
                  <BulkSelect
                    value={user.role}
                    onChange={(e) => handleChange(index, 'role', e.target.value)}
                  >
                    <option value="user">사용자</option>
                    <option value="admin">관리자</option>
                  </BulkSelect>
                </BulkTd>
                <BulkTd>
                  <RemoveButton type="button" onClick={() => removeUserRow(index)}>
                    ✕
                  </RemoveButton>
                </BulkTd>
              </tr>
            ))}
          </tbody>
        </BulkTable>
        <AddButton type="button" onClick={addUserRow}>
          + 행 추가
        </AddButton>
        <ButtonGroup>
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '등록 중...' : `${users.length}명 등록`}
          </Button>
        </ButtonGroup>
      </form>
    </Modal>
  );
};

// 추가 스타일링
const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const Select = styled.select`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
`;

const BulkTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  
  th, td {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    text-align: left;
  }
`;

const BulkTh = styled.th`
  background-color: var(--bg-secondary);
  font-weight: 600;
  white-space: nowrap;
`;

const BulkTd = styled.td`
  background-color: var(--bg-primary);
`;

const BulkInput = styled.input`
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.75rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const BulkSelect = styled.select`
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.75rem;
  background-color: var(--bg-primary);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const RemoveButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: #fee2e2;
  color: #991b1b;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  
  &:hover {
    background-color: #fecaca;
  }
`;

const AddButton = styled.button`
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px dashed var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.875rem;
  width: 100%;
  
  &:hover {
    background-color: var(--border-color);
  }
`;