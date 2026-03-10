import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Layout } from '../components/layout';
import { Button, Input, Card, Modal } from '../components/ui';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import userService from '../services/userService';
import reservationService from '../services/reservationService';
import faceService from '../services/faceService';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2rem;
`;

const TabNav = styled.nav`
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
  overflow-x: auto;
`;

const TabButton = styled.button`
  padding: 1rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border-bottom: 2px solid ${({ $active }) => $active ? 'var(--primary-color)' : 'transparent'};
  white-space: nowrap;
  transition: var(--transition);
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ContentCard = styled(Card)`
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ReservationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReservationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  transition: var(--transition);
  
  &:hover {
    border-color: var(--primary-color);
    background-color: var(--bg-secondary);
  }
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ReservationInfo = styled.div`
  flex: 1;
`;

const ReservationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const ReservationMeta = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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
      case 'confirmed':
        return 'background-color: #dcfce7; color: #166534;';
      case 'pending':
        return 'background-color: #fef3c7; color: #92400e;';
      case 'completed':
        return 'background-color: #dbeafe; color: #1e40af;';
      case 'cancelled':
        return 'background-color: #fee2e2; color: #991b1b;';
      default:
        return 'background-color: var(--bg-tertiary); color: var(--text-secondary);';
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
`;

// Face Registration Styles
const FaceRegistrationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const VideoPreview = styled.video`
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  background: #000;
  transform: scaleX(-1);
`;

const CanvasPreview = styled.canvas`
  display: none;
`;

const FaceOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 240px;
  border: 3px solid ${props => props.$detected ? '#4CAF50' : '#fff'};
  border-radius: 50% 50% 45% 45%;
  pointer-events: none;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 480px;
`;

const FaceStatusCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${props => props.$registered ? '#dcfce7' : '#fef3c7'};
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
`;

const FaceStatusIcon = styled.span`
  font-size: 2rem;
`;

const FaceStatusText = styled.div`
  flex: 1;
`;

const FaceStatusTitle = styled.p`
  font-weight: 600;
  color: ${props => props.$registered ? '#166534' : '#92400e'};
  margin: 0;
`;

const FaceStatusDesc = styled.p`
  font-size: 0.875rem;
  color: ${props => props.$registered ? '#166534' : '#92400e'};
  margin: 0.25rem 0 0;
  opacity: 0.8;
`;

// Instruction Styles
const InstructionCard = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const InstructionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
`;

const InstructionList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  
  li {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
    
    &:last-child {
      border-bottom: none;
    }
    
    strong {
      color: var(--primary-color);
    }
  }
`;

const InstructionTip = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: #e0f2fe;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin: 0;
`;

const FaceGuideText = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  white-space: nowrap;
  pointer-events: none;
`;

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '대기중';
    case 'confirmed': return '확정됨';
    case 'completed': return '완료됨';
    case 'cancelled': return '취소됨';
    default: return status;
  }
};

const MyPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [reservations, setReservations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Face registration state
  const [faceStatus, setFaceStatus] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const { user, logout, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user, reset]);

  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchReservations();
    } else if (activeTab === 'experiences') {
      fetchExperiences();
    } else if (activeTab === 'face') {
      fetchFaceStatus();
    }
  }, [activeTab]);

  // Cleanup camera on unmount or tab change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'face') {
      stopCamera();
    }
  }, [activeTab]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await userService.getMyReservations();
      if (response.success) {
        setReservations(response.data || []);
      }
    } catch (error) {
      toast.error('예약 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await userService.getMyExperiences();
      if (response.success) {
        setExperiences(response.data || []);
      }
    } catch (error) {
      toast.error('체험 기록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaceStatus = async () => {
    try {
      const response = await faceService.getFaceStatus();
      setFaceStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch face status:', error);
    }
  };

  const startCamera = async () => {
    try {
      console.log('카메라 시작 요청...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: 'user' }
      });
      console.log('카메라 스트림 획득 성공:', stream);
      streamRef.current = stream;
      
      if (videoRef.current) {
        console.log('비디오 요소에 스트림 설정...');
        videoRef.current.srcObject = stream;
        
        // 비디오가 로드될 때까지 기다림
        videoRef.current.onloadedmetadata = () => {
          console.log('비디오 메타데이터 로드 완료');
          videoRef.current.play().then(() => {
            console.log('비디오 재생 시작');
            setIsStreaming(true);
          }).catch(err => {
            console.error('비디오 재생 실패:', err);
            toast.error('비디오 재생에 실패했습니다.');
          });
        };
      } else {
        console.error('videoRef.current가 null입니다');
        toast.error('비디오 요소를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('카메라 접근 오류:', error);
      toast.error('카메라 접근에 실패했습니다. 카메라 권한을 허용해주세요.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const captureAndRegister = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // 비디오 준비 상태 확인
    if (video.readyState < 2) {
      toast.error('카메라가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 변환 행렬 초기화 (누적 방지)
    context.setTransform(1, 0, 0, 1, 0, 0);
    
    // Mirror the image
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    setIsRegistering(true);
    try {
      const response = await faceService.registerFace(null, imageData);
      if (response.success) {
        toast.success('얼굴 등록이 완료되었습니다!');
        fetchFaceStatus();
        stopCamera();
      } else {
        toast.error(response.message || '얼굴 등록에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error.message || '얼굴 등록에 실패했습니다.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeleteFace = async () => {
    try {
      const response = await faceService.deleteFace();
      if (response.success) {
        toast.success('얼굴 데이터가 삭제되었습니다.');
        setFaceStatus({ is_registered: false });
      } else {
        toast.error(response.message || '얼굴 데이터 삭제에 실패했습니다');
      }
    } catch (error) {
      toast.error(error.message || '얼굴 데이터 삭제에 실패했습니다');
    }
  };

  const handleProfileUpdate = async (data) => {
    try {
      const response = await userService.updateProfile(data);
      if (response.success) {
        toast.success('프로필이 업데이트되었습니다.');
        refreshUser();
      } else {
        toast.error(response.message || '프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error.message || '프로필 업데이트에 실패했습니다.');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      const response = await reservationService.cancelReservation(reservationId);
      if (response.success) {
        toast.success('예약이 취소되었습니다.');
        fetchReservations();
      } else {
        toast.error(response.message || '예약 취소에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error.message || '예약 취소에 실패했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await userService.deleteAccount();
      if (response.success) {
        toast.success('회원 탈퇴가 완료되었습니다.');
        logout();
        navigate('/');
      } else {
        toast.error(response.message || '회원 탈퇴에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error.message || '회원 탈퇴에 실패했습니다.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <Layout>
      <PageContainer>
        <PageTitle>마이페이지</PageTitle>
        
        <TabNav>
          <TabButton $active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
            내 정보
          </TabButton>
          <TabButton $active={activeTab === 'reservations'} onClick={() => setActiveTab('reservations')}>
            예약 내역
          </TabButton>
          <TabButton $active={activeTab === 'experiences'} onClick={() => setActiveTab('experiences')}>
            체험 기록
          </TabButton>
          <TabButton $active={activeTab === 'face'} onClick={() => setActiveTab('face')}>
            얼굴 등록
          </TabButton>
        </TabNav>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            <ContentCard title="프로필 정보">
              <Form onSubmit={handleSubmit(handleProfileUpdate)}>
                <FormRow>
                  <Input
                    label="이름"
                    name="name"
                    required
                    {...register('name', { required: '이름은 필수 입력입니다' })}
                    error={errors.name?.message}
                  />
                  <Input
                    label="이메일"
                    name="email"
                    type="email"
                    required
                    {...register('email', {
                      required: '이메일은 필수 입력입니다',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: '올바른 이메일 형식이 아닙니다',
                      },
                    })}
                    error={errors.email?.message}
                  />
                </FormRow>
                <FormRow>
                  <Input
                    label="전화번호"
                    name="phone"
                    type="tel"
                    {...register('phone', {
                      pattern: {
                        value: /^[0-9-]+$/,
                        message: '올바른 전화번호 형식이 아닙니다',
                      },
                    })}
                    error={errors.phone?.message}
                  />
                  <Input
                    label="아이디"
                    name="username"
                    value={user?.username || ''}
                    disabled
                    helperText="아이디는 변경할 수 없습니다."
                  />
                </FormRow>
                <Button type="submit">프로필 업데이트</Button>
              </Form>
            </ContentCard>
            
            <ContentCard title="계정 관리">
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                회원 탈퇴
              </Button>
            </ContentCard>
          </>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <ContentCard title="예약 내역">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>불러오는 중...</div>
            ) : reservations.length > 0 ? (
              <ReservationList>
                {reservations.map((reservation) => (
                  <ReservationItem key={reservation.id}>
                    <ReservationInfo>
                      <ReservationTitle>{reservation.program_name || '프로그램'}</ReservationTitle>
                      <ReservationMeta>
                        <span>날짜: {reservation.reserved_date}</span>
                        <span>시간: {reservation.reserved_time}</span>
                        <span>참여자: {reservation.participant_count}명</span>
                      </ReservationMeta>
                    </ReservationInfo>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <StatusBadge $status={reservation.status}>
                        {getStatusText(reservation.status)}
                      </StatusBadge>
                      {reservation.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleCancelReservation(reservation.id)}
                        >
                          취소
                        </Button>
                      )}
                    </div>
                  </ReservationItem>
                ))}
              </ReservationList>
            ) : (
              <EmptyState>
                예약 내역을 찾을 수 없습니다.
                <br />
                <Button variant="primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/reservation')}>
                  예약하기
                </Button>
              </EmptyState>
            )}
          </ContentCard>
        )}

        {/* Experiences Tab */}
        {activeTab === 'experiences' && (
          <ContentCard title="체험 기록">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>불러오는 중...</div>
            ) : experiences.length > 0 ? (
              <ReservationList>
                {experiences.map((experience) => (
                  <ReservationItem key={experience.id}>
                    <ReservationInfo>
                      <ReservationTitle>{experience.program_name || '프로그램'}</ReservationTitle>
                      <ReservationMeta>
                        <span>날짜: {new Date(experience.entry_time).toLocaleDateString()}</span>
                        <span>입장: {new Date(experience.entry_time).toLocaleTimeString()}</span>
                        {experience.exit_time && (
                          <span>퇴장: {new Date(experience.exit_time).toLocaleTimeString()}</span>
                        )}
                      </ReservationMeta>
                    </ReservationInfo>
                    <StatusBadge $status="completed">완료</StatusBadge>
                  </ReservationItem>
                ))}
              </ReservationList>
            ) : (
              <EmptyState>
                체험기록이 없습니다.
              </EmptyState>
            )}
          </ContentCard>
        )}

        {/* Face Registration Tab */}
        {activeTab === 'face' && (
          <ContentCard title="얼굴 등록">
            <FaceRegistrationContainer>
              {faceStatus?.is_registered ? (
                <>
                  <FaceStatusCard $registered>
                    <FaceStatusIcon>face</FaceStatusIcon>
                    <FaceStatusText>
                      <FaceStatusTitle $registered>얼굴 등록됨</FaceStatusTitle>
                      <FaceStatusDesc $registered>
                        등록날짜: {new Date(faceStatus.registered_at).toLocaleDateString()}
                      </FaceStatusDesc>
                    </FaceStatusText>
                  </FaceStatusCard>
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                    키오스크에서 얼굴 인식으로 입장/퇴장 가능합니다.
                  </p>
                  <Button variant="danger" onClick={handleDeleteFace}>
                    얼굴 데이터 삭제
                  </Button>
                </>
              ) : (
                <>
                  <FaceStatusCard $registered={false}>
                    <FaceStatusIcon>📷</FaceStatusIcon>
                    <FaceStatusText>
                      <FaceStatusTitle $registered={false}>얼굴 미등록</FaceStatusTitle>
                      <FaceStatusDesc $registered={false}>
                        키오스크 출입 시스템을 사용하려면 얼굴을 등록하세요
                      </FaceStatusDesc>
                    </FaceStatusText>
                  </FaceStatusCard>

                  {!isStreaming && (
                    <InstructionCard>
                      <InstructionTitle>📝 얼굴 등록 방법</InstructionTitle>
                      <InstructionList>
                        <li>1. 아래 <strong>[카메라 시작]</strong> 버튼을 클릭하세요</li>
                        <li>2. 얼굴을 화면 중앙의 타원 안에 맞춰 주세요</li>
                        <li>3. <strong>[촬영 & 등록]</strong> 버튼을 클릭하면 등록 완료!</li>
                      </InstructionList>
                      <InstructionTip>
                        💡 팁: 밝은 곳에서 등록하고, 안경이나 모자를 벗으면 더 정확해요
                      </InstructionTip>
                    </InstructionCard>
                  )}

                  {/* 비디오 요소는 항상 렌더링 (숨김 처리) */}
                  <VideoContainer style={{ display: isStreaming ? 'block' : 'none' }}>
                    <VideoPreview ref={videoRef} autoPlay playsInline muted />
                    <FaceOverlay />
                    {isStreaming && <FaceGuideText>얼굴을 이 영역에 맞춰주세요</FaceGuideText>}
                  </VideoContainer>
                  <CanvasPreview ref={canvasRef} />
                  
                  {isStreaming && (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Button
                        onClick={captureAndRegister}
                        disabled={isRegistering}
                        size="large"
                      >
                        {isRegistering ? '등록 중...' : '촬영 & 등록'}
                      </Button>
                      <Button variant="secondary" onClick={stopCamera}>
                        취소
                      </Button>
                    </div>
                  )}
                  
                  {!isStreaming && (
                    <Button onClick={startCamera} size="large">
                      카메라 시작
                    </Button>
                  )}
                </>
              )}
            </FaceRegistrationContainer>
          </ContentCard>
        )}
      </PageContainer>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="회원 탈퇴"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              탈퇴
            </Button>
          </>
        }
      >
        <p>정말 회원 탈퇴하시겠습니까?</p>
        <p style={{ color: 'var(--error-color)', marginTop: '0.5rem' }}>
          모든 데이터는 영구적으로 삭제되며 복구할 수 없습니다..
        </p>
      </Modal>
    </Layout>
  );
};

export default MyPage;
