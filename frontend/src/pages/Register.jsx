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

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 450px;
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const LoginLink = styled.div`
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

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      email: '',
      phone: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { confirmPassword, ...userData } = data;
      
      const response = await registerUser(userData);
      
      if (response.success) {
        toast.success('회원가입 성공');
        navigate('/login');
      } else {
        toast.error(response.message || '회원가입 실패');
      }
    } catch (error) {
      toast.error(error.message || '회원가입 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageContainer>
        <RegisterCard>
          <Title>회원가입</Title>
          <Subtitle>안전체험관 서비스를 이용하려면 회원가입하세요</Subtitle>
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="아이디"
              name="username"
              placeholder="아이디 입력 (4-20자)"
              required
              {...register('username', {
                required: '아이디를 입력하세요',
                minLength: {
                  value: 4,
                  message: '아이디는 최소 4자 이상이어야 합니다',
                },
                maxLength: {
                  value: 20,
                  message: '아이디는 최대 20자까지 가능합니다',
                },
              })}
              error={errors.username?.message}
            />
            
            <Input
              label="비밀번호"
              name="password"
              type="password"
              placeholder="비밀번호 입력 (8자 이상)"
              required
              {...register('password', {
                required: '비밀번호를 입력하세요',
                minLength: {
                  value: 8,
                  message: '비밀번호는 최소 8자 이상이어야 합니다',
                },
              })}
              error={errors.password?.message}
            />
            
            <Input
              label="비밀번호 확인"
              name="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              required
              {...register('confirmPassword', {
                required: '비밀번호를 확인하세요',
                validate: (value) =>
                  value === password || '비밀번호가 일치하지 않습니다',
              })}
              error={errors.confirmPassword?.message}
            />
            
            <Input
              label="이름"
              name="name"
              placeholder="이름을 입력하세요"
              required
              {...register('name', {
                required: '이름을 입력하세요',
              })}
              error={errors.name?.message}
            />
            
            <FormRow>
              <Input
                label="이메일"
                name="email"
                type="email"
                placeholder="이메일을 입력하세요"
                required
                {...register('email', {
                  required: '이메일을 입력하세요',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '올바른 이메일 형식이 아닙니다',
                  },
                })}
                error={errors.email?.message}
              />
              
              <Input
                label="전화번호"
                name="phone"
                type="tel"
                placeholder="전화번호 입력 (예: 010-1234-5678)"
                {...register('phone', {
                  pattern: {
                    value: /^[0-9-]+$/,
                    message: '올바른 전화번호 형식이 아닙니다',
                  },
                })}
                error={errors.phone?.message}
              />
            </FormRow>
            
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              회원가입
            </Button>
          </Form>
          
          <LoginLink>
            이미 계정이 있으신가요?<Link to="/login">로그인</Link>
          </LoginLink>
        </RegisterCard>
      </PageContainer>
    </Layout>
  );
};

export default Register;