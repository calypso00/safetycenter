import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Layout } from '../components/layout';
import { Button, Card, Input } from '../components/ui';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import boardService from '../services/boardService';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  min-height: 300px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const BoardWrite = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'inquiry',
  });
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.warning('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    
    if (!formData.title.trim()) {
      toast.warning('제목을 입력해주세요.');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.warning('내용을 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      const response = await boardService.createPost(formData);
      
      if (response.success) {
        toast.success('게시글이 등록되었습니다.');
        navigate('/board');
      } else {
        toast.error(response.message || '게시글 등록에 실패했습니다.');
      }
    } catch (error) {
      toast.error('게시글 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/board');
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <PageTitle>글쓰기</PageTitle>
        </PageHeader>

        <Card>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="category">카테고리</Label>
              <Select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="inquiry">1:1 문의</option>
                {isAdmin() && (
                  <>
                    <option value="notice">공지사항</option>
                    <option value="faq">FAQ</option>
                  </>
                )}
              </Select>
              {!isAdmin() && (
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  * 공지사항과 FAQ는 관리자만 작성할 수 있습니다.
                </small>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="제목을 입력하세요"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="content">내용</Label>
              <TextArea
                id="content"
                name="content"
                placeholder="내용을 입력하세요"
                value={formData.content}
                onChange={handleChange}
              />
            </FormGroup>

            <ButtonGroup>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? '등록 중...' : '등록'}
              </Button>
            </ButtonGroup>
          </form>
        </Card>
      </PageContainer>
    </Layout>
  );
};

export default BoardWrite;
