import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Layout } from '../../components/layout';
import { Button, Card, Input, Modal, Loading } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';
import boardService from '../../services/boardService';

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

const SearchInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  width: 250px;
  
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

const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${({ $category }) => {
    switch ($category) {
      case 'notice':
        return 'background-color: #dbeafe; color: #1e40af;';
      case 'inquiry':
        return 'background-color: #fef3c7; color: #92400e;';
      case 'faq':
        return 'background-color: #dcfce7; color: #166534;';
      case 'general':
        return 'background-color: var(--bg-tertiary); color: var(--text-secondary);';
      default:
        return 'background-color: var(--bg-tertiary); color: var(--text-secondary);';
    }
  }}
`;

const ActionButton = styled.button`
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  border-radius: var(--border-radius);
  margin-right: 0.5rem;
  transition: var(--transition);
  border: none;
  cursor: pointer;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'danger':
        return 'background-color: #fee2e2; color: #991b1b; &:hover { background-color: #fecaca; }';
      case 'primary':
        return 'background-color: #dbeafe; color: #1e40af; &:hover { background-color: #bfdbfe; }';
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ModalSection = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ModalSectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const ModalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  
  &:not(:last-child) {
    border-bottom: 1px dashed var(--border-color);
  }
`;

const ModalLabel = styled.span`
  font-weight: 500;
  color: var(--text-secondary);
`;

const ModalValue = styled.span`
  color: var(--text-primary);
`;

const PostContent = styled.div`
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--text-primary);
  min-height: 100px;
  max-height: 300px;
  overflow-y: auto;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
`;

const CommentItem = styled.div`
  padding: 0.75rem;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
`;

const CommentDate = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const CommentContent = styled.p`
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const categoryLabels = {
  notice: '공지사항',
  inquiry: '문의',
  faq: 'FAQ',
  general: '일반'
};

const categoryOptions = [
  { value: '', label: '전체' },
  { value: 'notice', label: '공지사항' },
  { value: 'inquiry', label: '문의' },
  { value: 'faq', label: 'FAQ' },
  { value: 'general', label: '일반' }
];

const BoardManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // 필터 상태
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { isAdmin } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('관리자 권한이 필요합니다.');
      window.location.href = '/';
      return;
    }
    
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(categoryFilter && { category: categoryFilter }),
        ...(searchQuery && { search: searchQuery })
      };
      
      const response = await boardService.getPosts(params);
      if (response.success) {
        setPosts(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error('게시글 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    setPage(1);
    fetchPosts();
  };

  const handleResetFilters = () => {
    setCategoryFilter('');
    setSearchQuery('');
    setPage(1);
    setTimeout(() => fetchPosts(), 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange();
  };

  const handleViewDetail = async (post) => {
    try {
      const response = await boardService.getPostById(post.id);
      if (response.success) {
        setSelectedPost(response.data);
        setShowModal(true);
      }
    } catch (error) {
      toast.error('게시글 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await boardService.deletePost(postId);
      if (response.success) {
        toast.success('게시글이 삭제되었습니다.');
        setShowModal(false);
        setSelectedPost(null);
        fetchPosts();
      } else {
        toast.error(response.message || '게시글 삭제에 실패했습니다.');
      }
    } catch (error) {
      toast.error('게시글 삭제에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await boardService.deleteComment(commentId);
      if (response.success) {
        toast.success('댓글이 삭제되었습니다.');
        // 댓글 삭제 후 게시글 상세 정보 다시 불러오기
        if (selectedPost) {
          const postResponse = await boardService.getPostById(selectedPost.id);
          if (postResponse.success) {
            setSelectedPost(postResponse.data);
          }
        }
      } else {
        toast.error(response.message || '댓글 삭제에 실패했습니다.');
      }
    } catch (error) {
      toast.error('댓글 삭제에 실패했습니다.');
    }
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

  if (loading && posts.length === 0) {
    return (
      <Layout hideHeader hideFooter>
        <PageContainer>
          <Sidebar>
            <SidebarTitle>관리자 메뉴</SidebarTitle>
            <SidebarNav>
              <SidebarLink href="/admin">📊 대시보드</SidebarLink>
              <SidebarLink href="/admin/users">👥 사용자 관리</SidebarLink>
              <SidebarLink href="/admin/reservations">📅 예약 관리</SidebarLink>
              <SidebarLink href="/admin/programs">🎯 프로그램 관리</SidebarLink>
              <SidebarLink href="/admin/board" $active>📝 게시판 관리</SidebarLink>
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
            <SidebarLink href="/admin/programs">🎯 프로그램 관리</SidebarLink>
            <SidebarLink href="/admin/board" $active>📝 게시판 관리</SidebarLink>
            <SidebarLink href="/admin/statistics">📈 통계</SidebarLink>
          </SidebarNav>
        </Sidebar>
        <MainContent>
          <PageHeader>
            <PageTitle>게시판 관리</PageTitle>
          </PageHeader>

          <FilterBar>
            <FilterGroup>
              <FilterLabel>카테고리:</FilterLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <form onSubmit={handleSearch}>
                <SearchInput
                  type="text"
                  placeholder="제목 또는 내용 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
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
            {posts.length === 0 ? (
              <EmptyState>게시글이 없습니다.</EmptyState>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>카테고리</Th>
                    <Th>제목</Th>
                    <Th>작성자</Th>
                    <Th>조회수</Th>
                    <Th>댓글</Th>
                    <Th>작성일</Th>
                    <Th>작업</Th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <Tr key={post.id}>
                      <Td>{post.id}</Td>
                      <Td>
                        <CategoryBadge $category={post.category}>
                          {categoryLabels[post.category] || post.category}
                        </CategoryBadge>
                      </Td>
                      <Td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.title}
                      </Td>
                      <Td>{post.author_name || post.author_id}</Td>
                      <Td>{post.view_count || 0}</Td>
                      <Td>{post.comment_count || 0}</Td>
                      <Td>{formatDate(post.created_at)}</Td>
                      <Td>
                        <ActionButton onClick={() => handleViewDetail(post)}>
                          상세
                        </ActionButton>
                        <ActionButton
                          $variant="danger"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          삭제
                        </ActionButton>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
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
        title="게시글 상세 정보"
        size="large"
        footer={
          <>
            <Button
              variant="danger"
              onClick={() => selectedPost && handleDeletePost(selectedPost.id)}
              loading={deleteLoading}
            >
              게시글 삭제
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              닫기
            </Button>
          </>
        }
      >
        {selectedPost && (
          <ModalContent>
            <ModalSection>
              <ModalSectionTitle>기본 정보</ModalSectionTitle>
              <ModalRow>
                <ModalLabel>ID</ModalLabel>
                <ModalValue>{selectedPost.id}</ModalValue>
              </ModalRow>
              <ModalRow>
                <ModalLabel>카테고리</ModalLabel>
                <ModalValue>
                  <CategoryBadge $category={selectedPost.category}>
                    {categoryLabels[selectedPost.category] || selectedPost.category}
                  </CategoryBadge>
                </ModalValue>
              </ModalRow>
              <ModalRow>
                <ModalLabel>제목</ModalLabel>
                <ModalValue>{selectedPost.title}</ModalValue>
              </ModalRow>
              <ModalRow>
                <ModalLabel>작성자</ModalLabel>
                <ModalValue>{selectedPost.author_name || selectedPost.author_id}</ModalValue>
              </ModalRow>
              <ModalRow>
                <ModalLabel>조회수</ModalLabel>
                <ModalValue>{selectedPost.view_count || 0}</ModalValue>
              </ModalRow>
              <ModalRow>
                <ModalLabel>작성일</ModalLabel>
                <ModalValue>{formatDateTime(selectedPost.created_at)}</ModalValue>
              </ModalRow>
              <ModalRow>
                <ModalLabel>수정일</ModalLabel>
                <ModalValue>{formatDateTime(selectedPost.updated_at)}</ModalValue>
              </ModalRow>
            </ModalSection>

            <ModalSection>
              <ModalSectionTitle>내용</ModalSectionTitle>
              <PostContent>{selectedPost.content}</PostContent>
            </ModalSection>

            <ModalSection>
              <ModalSectionTitle>
                댓글 목록 ({selectedPost.comments?.length || 0})
              </ModalSectionTitle>
              {selectedPost.comments && selectedPost.comments.length > 0 ? (
                <CommentList>
                  {selectedPost.comments.map((comment) => (
                    <CommentItem key={comment.id}>
                      <CommentHeader>
                        <CommentAuthor>{comment.author_name || comment.author_id}</CommentAuthor>
                        <CommentDate>{formatDateTime(comment.created_at)}</CommentDate>
                      </CommentHeader>
                      <CommentContent>{comment.content}</CommentContent>
                      <CommentActions>
                        <ActionButton
                          $variant="danger"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          댓글 삭제
                        </ActionButton>
                      </CommentActions>
                    </CommentItem>
                  ))}
                </CommentList>
              ) : (
                <EmptyState>댓글이 없습니다.</EmptyState>
              )}
            </ModalSection>
          </ModalContent>
        )}
      </Modal>
    </Layout>
  );
};

export default BoardManagement;
