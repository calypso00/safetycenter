import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Layout } from '../components/layout';
import { Button, Card, Input, Modal } from '../components/ui';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import boardService from '../services/boardService';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PostHeader = styled.div`
  margin-bottom: 1.5rem;
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
  margin-bottom: 0.75rem;
`;

const PostTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
`;

const PostMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const PostContent = styled.div`
  padding: 1.5rem 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  min-height: 200px;
  line-height: 1.8;
  white-space: pre-wrap;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
`;

const CommentSection = styled.div`
  margin-top: 2rem;
`;

const CommentHeader = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CommentItem = styled.div`
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
`;

const CommentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const CommentAuthor = styled.span`
  font-weight: 500;
  font-size: 0.875rem;
`;

const CommentDate = styled.span`
  font-size: 0.75rem;
  color: var(--text-light);
`;

const CommentContent = styled.p`
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const getCategoryText = (category) => {
  switch (category) {
    case 'notice': return '공지';
    case 'faq': return 'FAQ';
    default: return '문의';
  }
};

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await boardService.getPostById(id);
      if (response.success) {
        setPost(response.data);
        setComments(response.data?.comments || []);
      } else {
        toast.error('게시글을 찾을 수 없습니다.');
        navigate('/board');
      }
    } catch (error) {
      toast.error('게시글을 불러오는데 실패했습니다.');
      navigate('/board');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await boardService.deletePost(id);
      if (response.success) {
        toast.success('게시글이 삭제되었습니다.');
        navigate('/board');
      } else {
        toast.error(response.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      toast.error('삭제에 실패했습니다.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.warning('로그인이 필요합니다.');
      return;
    }
    
    if (!commentText.trim()) {
      toast.warning('댓글 내용을 입력해주세요.');
      return;
    }
    
    try {
      const response = await boardService.createComment(id, { content: commentText });
      if (response.success) {
        toast.success('댓글이 등록되었습니다.');
        setCommentText('');
        fetchPost();
      } else {
        toast.error(response.message || '댓글 등록에 실패했습니다.');
      }
    } catch (error) {
      toast.error('댓글 등록에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await boardService.deleteComment(commentId);
      if (response.success) {
        toast.success('댓글이 삭제되었습니다.');
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        toast.error(response.message || '댓글 삭제에 실패했습니다.');
      }
    } catch (error) {
      toast.error('댓글 삭제에 실패했습니다.');
    }
  };

  const isAuthor = post && user && post.user_id === user.id;

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
        </PageContainer>
      </Layout>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <Layout>
      <PageContainer>
        <Card>
          <PostHeader>
            <PostCategory $category={post.category}>
              {getCategoryText(post.category)}
            </PostCategory>
            <PostTitle>{post.title}</PostTitle>
            <PostMeta>
              <span>작성자: {post.author_name || '익명'}</span>
              <span>작성일: {new Date(post.created_at).toLocaleDateString()}</span>
              <span>조회: {post.view_count || 0}</span>
            </PostMeta>
          </PostHeader>
          
          <PostContent>{post.content}</PostContent>
          
          <ActionButtons>
            <Button variant="secondary" onClick={() => navigate('/board')}>
              목록으로
            </Button>
            {isAuthor && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="outline" onClick={() => navigate(`/board/edit/${id}`)}>
                  수정
                </Button>
                <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                  삭제
                </Button>
              </div>
            )}
          </ActionButtons>
        </Card>

        <CommentSection>
          <CommentHeader>댓글 ({comments.length})</CommentHeader>
          
          {comments.length > 0 ? (
            <CommentList>
              {comments.map((comment) => (
                <CommentItem key={comment.id}>
                  <CommentMeta>
                    <CommentAuthor>{comment.author_name || '익명'}</CommentAuthor>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CommentDate>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </CommentDate>
                      {user && comment.user_id === user.id && (
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  </CommentMeta>
                  <CommentContent>{comment.content}</CommentContent>
                </CommentItem>
              ))}
            </CommentList>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
              댓글이 없습니다.
            </div>
          )}
          
          <CommentForm onSubmit={handleCommentSubmit}>
            <CommentInput
              type="text"
              placeholder={isAuthenticated ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!isAuthenticated}
            />
            <Button type="submit" disabled={!isAuthenticated || !commentText.trim()}>
              등록
            </Button>
          </CommentForm>
        </CommentSection>
      </PageContainer>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="게시글 삭제"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              삭제
            </Button>
          </>
        }
      >
        <p>정말로 이 게시글을 삭제하시겠습니까?</p>
      </Modal>
    </Layout>
  );
};

export default PostDetail;