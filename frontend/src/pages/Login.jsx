import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import { Layout } from '../components/layout';
import { Button, Input, Card } from '../components/ui';

const PageContainer = styled.div`
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: var(--bg-secondary);
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
`;

const ForgotPassword = styled(Link)`
  font-size: 0.875rem;
  color: var(--primary-color);
  text-align: right;
  margin-top: -0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  
  a {
    color: var(--primary-color);
    font-weight: 500;
    margin-left: 0.25rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await login(data);
      
      if (response.success) {
        toast.success('로그인 성공');
        navigate('/');
      } else {
        toast.error(response.message || '로그인 실패');
      }
    } catch (error) {
      toast.error(error.message || '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageContainer>
        <LoginCard>
          <Title>로그인</Title>
          <Subtitle>안전체험관 서비스를 이용하려면 로그인하세요</Subtitle>
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="아이디"
              name="username"
              placeholder="아이디를 입력하세요"
              required
              {...register('username', {
                required: '아이디를 입력하세요',
              })}
              error={errors.username?.message}
            />
            
            <Input
              label="비밀번호"
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
              {...register('password', {
                required: '비밀번호를 입력하세요',
              })}
              error={errors.password?.message}
            />
            
            <ForgotPassword to="/forgot-password">
              비밀번호를 잊으셨나요?
            </ForgotPassword>
            
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              로그인
            </Button>
          </Form>
          
          <RegisterLink>
            계정이 없으신가요?<Link to="/register">회원가입</Link>
          </RegisterLink>
        </LoginCard>
      </PageContainer>
    </Layout>
  );
};

export default Login;