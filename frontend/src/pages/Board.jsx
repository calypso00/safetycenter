import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Layout } from '../components/layout';
import { Button, Card, Input, Modal } from '../components/ui';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import boardService from '../services/boardService';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const CategoryButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--bg-tertiary)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-secondary)'};
  transition: var(--transition);
  
  &:hover {
    background-color: ${({ $active }) => $active ? 'var(--primary-dark)' : 'var(--border-color)'};
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
`;

const PostItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--bg-secondary);
  }
`;

const PostCategory = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${({ $category }) => {
    switch ($category) {
      case 'notice': return '#dbeafe';
      case 'faq': return '#dcfce7';
      default: return 'var(--bg-tertiary)';
    }
  }};
  color: ${({ $category }) => {
    switch ($category) {
      case 'notice': return '#1e40af';
      case 'faq': return '#166534';
      default: return 'var(--text-secondary)';
    }
  }};
  min-width: 60px;
  text-align: center;
  margin-right: 1rem;
`;

const PostTitle = styled.span`
  flex: 1;
  font-size: 0.9375rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-light);
  margin-left: 1rem;
  
  @media (max-width: 600px) {
    display: none;
  }
`;

const PostAuthor = styled.span``;

const PostDate = styled.span``;

const PostViews = styled.span``;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
`;

const getCategoryText = (category) => {
  switch (category) {
    case 'notice': return '공지';
    case 'faq': return 'FAQ';
    default: return '문의';
  }
};

const Board = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [category, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(category !== 'all' && { category }),
        ...(searchQuery && { search: searchQuery }),
      };
      
      const response = await boardService.getPosts(params);
      if (response.success) {
        setPosts(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (newCategory) => {
    setSearchParams({ category: newCategory, page: '1' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ category, page: '1', search: searchQuery });
    fetchPosts();
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ category, page: newPage.toString() });
  };

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      toast.warning('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    navigate('/board/write');
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <PageTitle>게시판</PageTitle>
          <Button onClick={handleWriteClick}>글쓰기</Button>
        </PageHeader>

        <FilterBar>
          <CategoryButton
            $active={category === 'all'}
            onClick={() => handleCategoryChange('all')}
          >
            전체
          </CategoryButton>
          <CategoryButton
            $active={category === 'notice'}
            onClick={() => handleCategoryChange('notice')}
          >
            공지사항
          </CategoryButton>
          <CategoryButton
            $active={category === 'faq'}
            onClick={() => handleCategoryChange('faq')}
          >
            FAQ
          </CategoryButton>
          <CategoryButton
            $active={category === 'inquiry'}
            onClick={() => handleCategoryChange('inquiry')}
          >
            1:1 문의
          </CategoryButton>
        </FilterBar>

        <form onSubmit={handleSearch}>
          <SearchBar>
            <SearchInput
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" variant="secondary">검색</Button>
          </SearchBar>
        </form>

        <Card>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
          ) : posts.length > 0 ? (
            <PostList>
              {posts.map((post) => (
                <PostItem key={post.id} to={`/board/${post.id}`}>
                  <PostCategory $category={post.category}>
                    {getCategoryText(post.category)}
                  </PostCategory>
                  <PostTitle>{post.title}</PostTitle>
                  <PostMeta>
                    <PostAuthor>{post.author_name || '익명'}</PostAuthor>
                    <PostDate>{new Date(post.created_at).toLocaleDateString()}</PostDate>
                    <PostViews>조회 {post.view_count || 0}</PostViews>
                  </PostMeta>
                </PostItem>
              ))}
            </PostList>
          ) : (
            <EmptyState>게시글이 없습니다.</EmptyState>
          )}
        </Card>

        {totalPages > 1 && (
          <Pagination>
            <PageButton
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              이전
            </PageButton>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <PageButton
                  key={p}
                  $active={p === page}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </PageButton>
              ))}
            <PageButton
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              다음
            </PageButton>
          </Pagination>
        )}
      </PageContainer>
    </Layout>
  );
};

export default Board;