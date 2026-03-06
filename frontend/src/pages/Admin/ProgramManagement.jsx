import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Layout } from '../../components/layout';
import { Button, Card, Input, Modal, Loading } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';
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

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: var(--transition);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: var(--transition);
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: var(--transition);
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const ConfirmText = styled.p`
  font-size: 1rem;
  color: var(--text-primary);
  text-align: center;
  margin: 1rem 0;
`;

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'delete'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: '',
    capacity: '',
    location: '',
    status: 'active'
  });
  
  const { isAdmin } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('관리자 권한이 필요합니다.');
      window.location.href = '/';
      return;
    }
    
    fetchPrograms();
  }, [page]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await programService.getPrograms({ page, limit: 10, search: searchQuery });
      if (response.success) {
        setPrograms(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error('프로그램 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPrograms();
  };

  const handleCreateClick = () => {
    setModalMode('create');
    setFormData({
      name: '',
      description: '',
      duration_minutes: '',
      capacity: '',
      location: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditClick = (program) => {
    setModalMode('edit');
    setSelectedProgram(program);
    setFormData({
      name: program.name,
      description: program.description || '',
      duration_minutes: program.duration_minutes || '',
      capacity: program.capacity || '',
      location: program.location || '',
      status: program.status || 'active'
    });
    setShowModal(true);
  };

  const handleDeleteClick = (program) => {
    setModalMode('delete');
    setSelectedProgram(program);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      if (modalMode === 'create') {
        const response = await programService.createProgram(data);
        if (response.success) {
          toast.success('프로그램이 생성되었습니다.');
          setShowModal(false);
          fetchPrograms();
        } else {
          toast.error(response.message || '프로그램 생성에 실패했습니다.');
        }
      } else if (modalMode === 'edit') {
        const response = await programService.updateProgram(selectedProgram.id, data);
        if (response.success) {
          toast.success('프로그램이 수정되었습니다.');
          setShowModal(false);
          fetchPrograms();
        } else {
          toast.error(response.message || '프로그램 수정에 실패했습니다.');
        }
      }
    } catch (error) {
      toast.error(modalMode === 'create' ? '프로그램 생성에 실패했습니다.' : '프로그램 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await programService.deleteProgram(selectedProgram.id);
      if (response.success) {
        toast.success('프로그램이 삭제되었습니다.');
        setShowModal(false);
        fetchPrograms();
      } else {
        toast.error(response.message || '프로그램 삭제에 실패했습니다.');
      }
    } catch (error) {
      toast.error('프로그램 삭제에 실패했습니다.');
    }
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create':
        return '프로그램 생성';
      case 'edit':
        return '프로그램 수정';
      case 'delete':
        return '프로그램 삭제';
      default:
        return '';
    }
  };

  if (loading && programs.length === 0) {
    return (
      <Layout hideHeader hideFooter>
        <PageContainer>
          <Sidebar>
            <SidebarTitle>관리자 메뉴</SidebarTitle>
            <SidebarNav>
              <SidebarLink href="/admin">📊 대시보드</SidebarLink>
              <SidebarLink href="/admin/users">👥 사용자 관리</SidebarLink>
              <SidebarLink href="/admin/reservations">📅 예약 관리</SidebarLink>
              <SidebarLink href="/admin/programs" $active>🎯 프로그램 관리</SidebarLink>
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
            <SidebarLink href="/admin/reservations">📅 예약 관리</SidebarLink>
            <SidebarLink href="/admin/programs" $active>🎯 프로그램 관리</SidebarLink>
            <SidebarLink href="/admin/board">📝 게시판 관리</SidebarLink>
            <SidebarLink href="/admin/statistics">📈 통계</SidebarLink>
          </SidebarNav>
        </Sidebar>
        <MainContent>
          <PageHeader>
            <PageTitle>프로그램 관리</PageTitle>
            <Button variant="primary" onClick={handleCreateClick}>
              + 새 프로그램
            </Button>
          </PageHeader>

          <form onSubmit={handleSearch}>
            <SearchBar>
              <SearchInput
                type="text"
                placeholder="프로그램명으로 검색..."
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
                  <Th>프로그램명</Th>
                  <Th>설명</Th>
                  <Th>소요시간</Th>
                  <Th>수용인원</Th>
                  <Th>위치</Th>
                  <Th>상태</Th>
                  <Th>작업</Th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <Tr key={program.id}>
                    <Td>{program.id}</Td>
                    <Td>{program.name}</Td>
                    <Td>{program.description ? program.description.substring(0, 30) + (program.description.length > 30 ? '...' : '') : '-'}</Td>
                    <Td>{program.duration_minutes ? `${program.duration_minutes}분` : '-'}</Td>
                    <Td>{program.capacity ? `${program.capacity}명` : '-'}</Td>
                    <Td>{program.location || '-'}</Td>
                    <Td>
                      <StatusBadge $active={program.status === 'active'}>
                        {program.status === 'active' ? '활성' : '비활성'}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <ActionButton onClick={() => handleEditClick(program)}>
                        수정
                      </ActionButton>
                      <ActionButton
                        $variant="danger"
                        onClick={() => handleDeleteClick(program)}
                      >
                        삭제
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
        title={getModalTitle()}
        size="medium"
        footer={
          modalMode === 'delete' ? (
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                취소
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                삭제
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                취소
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                {modalMode === 'create' ? '생성' : '저장'}
              </Button>
            </>
          )
        }
      >
        {modalMode === 'delete' ? (
          <ConfirmText>
            정말로 "{selectedProgram?.name}" 프로그램을 삭제하시겠습니까?
            <br />
            <small style={{ color: 'var(--text-secondary)' }}>이 작업은 되돌릴 수 없습니다.</small>
          </ConfirmText>
        ) : (
          <ModalContent>
            <FormGroup>
              <Label htmlFor="name">프로그램명 *</Label>
              <StyledInput
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="프로그램명을 입력하세요"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">설명</Label>
              <StyledTextarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="프로그램 설명을 입력하세요"
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label htmlFor="duration_minutes">소요시간 (분)</Label>
                <StyledInput
                  type="number"
                  id="duration_minutes"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  placeholder="예: 60"
                  min="1"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="capacity">수용인원</Label>
                <StyledInput
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="예: 20"
                  min="1"
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label htmlFor="location">위치</Label>
                <StyledInput
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="예: A동 101호"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="status">상태</Label>
                <StyledSelect
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </StyledSelect>
              </FormGroup>
            </FormRow>
          </ModalContent>
        )}
      </Modal>
    </Layout>
  );
};

export default ProgramManagement;
