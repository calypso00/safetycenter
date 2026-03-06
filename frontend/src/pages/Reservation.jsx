import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Layout } from '../components/layout';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import programService from '../services/programService';
import reservationService from '../services/reservationService';

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

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${({ $active, $completed }) => `
    color: ${$completed ? 'var(--success-color)' : $active ? 'var(--primary-color)' : 'var(--text-light)'};
  `}
`;

const StepNumber = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  
  ${({ $active, $completed }) => `
    background-color: ${$completed ? 'var(--success-color)' : $active ? 'var(--primary-color)' : 'var(--bg-tertiary)'};
    color: ${$completed || $active ? 'white' : 'var(--text-light)'};
  `}
`;

const StepLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
`;

const StepDivider = styled.div`
  width: 3rem;
  height: 2px;
  background-color: var(--border-color);
  margin: 0 1rem;
  
  ${({ $completed }) => $completed && `
    background-color: var(--success-color);
  `}
`;

const ContentCard = styled(Card)`
  margin-bottom: 1.5rem;
`;

const ProgramGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const ProgramItem = styled.div`
  padding: 1.25rem;
  border: 2px solid ${({ $selected }) => $selected ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    border-color: var(--primary-color);
    background-color: var(--bg-secondary);
  }
  
  ${({ $selected }) => $selected && `
    background-color: rgba(37, 99, 235, 0.05);
  `}
`;

const ProgramName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const ProgramMeta = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  gap: 1rem;
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

const TimeSlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
`;

const TimeSlot = styled.button`
  padding: 0.75rem;
  border: 2px solid ${({ $selected }) => $selected ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: var(--border-radius);
  background-color: ${({ $selected, $disabled }) => 
    $disabled ? 'var(--bg-tertiary)' : 
    $selected ? 'var(--primary-color)' : 'var(--bg-primary)'};
  color: ${({ $selected, $disabled }) => 
    $disabled ? 'var(--text-light)' : 
    $selected ? 'white' : 'var(--text-primary)'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: var(--transition);
  
  &:hover:not(:disabled) {
    border-color: var(--primary-color);
  }
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SummaryLabel = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const SummaryValue = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Reservation = () => {
  const [step, setStep] = useState(1);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      participantCount: 1,
      notes: '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('login required');
      navigate('/login');
      return;
    }
    
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const response = await programService.getPrograms();
        if (response.success) {
          setPrograms(response.data || []);
        }
      } catch (error) {
        toast.error('failed to load programs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrograms();
  }, [isAuthenticated, navigate, toast]);

  useEffect(() => {
    if (selectedProgram && selectedDate) {
      const fetchSlots = async () => {
        try {
          const response = await programService.getAvailableSlots(selectedProgram.id, selectedDate);
          if (response.success) {
            setAvailableSlots(response.data?.time_slots || []);
          }
        } catch (error) {
          console.error('Failed to fetch slots:', error);
        }
      };
      fetchSlots();
    }
  }, [selectedProgram, selectedDate]);

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setSelectedTime('');
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedProgram) {
      toast.warning('select program');
      return;
    }
    if (step === 2 && (!selectedDate || !selectedTime)) {
      toast.warning('select date and time');
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const reservationData = {
        programId: selectedProgram.id,
        reservedDate: selectedDate,
        reservedTime: selectedTime,
        participantCount: parseInt(data.participantCount, 10),
        notes: data.notes,
      };
      
      const response = await reservationService.createReservation(reservationData);
      
      if (response.success) {
        toast.success('reservation success');
        navigate('/mypage/reservations');
      } else {
        toast.error(response.message || 'reservation failed');
      }
    } catch (error) {
      toast.error(error.message || 'reservation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <Layout>
      <PageContainer>
        <PageTitle>체험 예약</PageTitle>
        
        {/* Step Indicator */}
        <StepIndicator>
          <Step $active={step === 1} $completed={step > 1}>
            <StepNumber $active={step === 1} $completed={step > 1}>1</StepNumber>
            <StepLabel>프로그램 선택</StepLabel>
          </Step>
          <StepDivider $completed={step > 1} />
          <Step $active={step === 2} $completed={step > 2}>
            <StepNumber $active={step === 2} $completed={step > 2}>2</StepNumber>
            <StepLabel>날짜/시간 선택</StepLabel>
          </Step>
          <StepDivider $completed={step > 2} />
          <Step $active={step === 3}>
            <StepNumber $active={step === 3}>3</StepNumber>
            <StepLabel>예약 확인</StepLabel>
          </Step>
        </StepIndicator>

        {/* Step 1: Program Selection */}
        {step === 1 && (
          <ContentCard title="프로그램 선택">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
            ) : (
              <ProgramGrid>
                {programs.map((program) => (
                  <ProgramItem
                    key={program.id}
                    $selected={selectedProgram?.id === program.id}
                    onClick={() => handleProgramSelect(program)}
                  >
                    <ProgramName>{program.name}</ProgramName>
                    <ProgramMeta>
                      <span>⏱️ {program.duration_minutes}분</span>
                      <span>👥 최대 {program.capacity}명</span>
                    </ProgramMeta>
                  </ProgramItem>
                ))}
              </ProgramGrid>
            )}
            <ButtonGroup>
              <Button onClick={handleNextStep} disabled={!selectedProgram}>
                다음
              </Button>
            </ButtonGroup>
          </ContentCard>
        )}

        {/* Step 2: Date/Time Selection */}
        {step === 2 && (
          <ContentCard title="날짜/시간 선택">
            <FormRow>
              <Input
                label="예약 날짜"
                name="date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={getMinDate()}
                max={getMaxDate()}
                required
              />
            </FormRow>
            
            {selectedDate && (
              <>
                <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>시간 선택</div>
                <TimeSlotGrid>
                  {timeSlots.map((time) => {
                    const slot = availableSlots.find(s => s.time === time);
                    const isAvailable = !slot || slot.available_count > 0;
                    const remaining = slot?.available_count ?? selectedProgram?.capacity ?? 0;
                    
                    return (
                      <TimeSlot
                        key={time}
                        type="button"
                        $selected={selectedTime === time}
                        $disabled={!isAvailable}
                        disabled={!isAvailable}
                        onClick={() => handleTimeSelect(time)}
                      >
                        {time}
                        <br />
                        <small>({remaining}석)</small>
                      </TimeSlot>
                    );
                  })}
                </TimeSlotGrid>
              </>
            )}
            
            <ButtonGroup>
              <Button variant="secondary" onClick={handlePrevStep}>
                이전
              </Button>
              <Button onClick={handleNextStep} disabled={!selectedDate || !selectedTime}>
                다음
              </Button>
            </ButtonGroup>
          </ContentCard>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <ContentCard title="예약 확인">
            <div style={{ marginBottom: '1.5rem' }}>
              <SummaryItem>
                <SummaryLabel>프로그램</SummaryLabel>
                <SummaryValue>{selectedProgram?.name}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>예약 날짜</SummaryLabel>
                <SummaryValue>{selectedDate}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>예약 시간</SummaryLabel>
                <SummaryValue>{selectedTime}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>소요 시간</SummaryLabel>
                <SummaryValue>{selectedProgram?.duration_minutes}분</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>장소</SummaryLabel>
                <SummaryValue>{selectedProgram?.location}</SummaryValue>
              </SummaryItem>
            </div>
            
            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormRow>
                <Input
                  label="참여 인원"
                  name="participantCount"
                  type="number"
                  min={1}
                  max={selectedProgram?.capacity || 10}
                  required
                  {...register('participantCount', {
                    required: '참여 인원을 입력해주세요',
                    min: { value: 1, message: '최소 1명 이상이어야 합니다' },
                    max: { 
                      value: selectedProgram?.capacity || 10, 
                      message: `최대 ${selectedProgram?.capacity || 10}명까지 가능합니다` 
                    },
                  })}
                  error={errors.participantCount?.message}
                />
              </FormRow>
              
              <Input
                label="요청사항"
                name="notes"
                placeholder="특이사항이 있으면 입력해주세요"
                {...register('notes')}
              />
              
              <ButtonGroup>
                <Button variant="secondary" type="button" onClick={handlePrevStep}>
                  이전
                </Button>
                <Button type="submit" loading={submitting}>
                  예약 완료
                </Button>
              </ButtonGroup>
            </Form>
          </ContentCard>
        )}
      </PageContainer>
    </Layout>
  );
};

export default Reservation;