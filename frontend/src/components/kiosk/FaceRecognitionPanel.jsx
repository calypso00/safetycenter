import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import faceService from '../../services/faceService';
import CameraCapture from './CameraCapture';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
  color: #fff;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #a0a0a0;
  margin-bottom: 30px;
  text-align: center;
`;

const ModeSelector = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
`;

const ModeButton = styled.button`
  padding: 15px 40px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$active ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$active ? '#fff' : '#a0a0a0'};
  border: 2px solid ${props => props.$active ? '#4CAF50' : 'transparent'};
  
  &:hover {
    background: ${props => props.$active ? '#45a049' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const CameraSection = styled.div`
  width: 100%;
  max-width: 640px;
  margin-bottom: 30px;
`;

const ResultCard = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 25px;
  background: ${props => props.$success 
    ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)' 
    : props.$error 
      ? 'linear-gradient(135deg, #c62828 0%, #8b0000 100%)'
      : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 15px;
  text-align: center;
  animation: ${props => props.$processing ? pulse : 'none'} 1.5s infinite;
`;

const ResultIcon = styled.div`
  font-size: 60px;
  margin-bottom: 15px;
`;

const ResultTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const ResultMessage = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 15px;
`;

const UserInfo = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  margin-top: 15px;
`;

const UserName = styled.p`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 5px;
`;

const UserDetail = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const ProcessingText = styled.p`
  font-size: 18px;
  color: #ffd700;
  animation: ${pulse} 1s infinite;
`;

const RetryButton = styled.button`
  margin-top: 20px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
`;

const StatusDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$online ? '#4CAF50' : '#f44336'};
`;

/**
 * FaceRecognitionPanel - Kiosk face recognition panel
 */
const FaceRecognitionPanel = ({ onEntry, onExit }) => {
  const [mode, setMode] = useState('entry'); // 'entry' or 'exit'
  const [status, setStatus] = useState('idle'); // 'idle', 'processing', 'success', 'error'
  const [result, setResult] = useState(null);
  const [moduleStatus, setModuleStatus] = useState(null);
  const processingRef = useRef(false);

  // Check module status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await faceService.getModuleStatus();
        setModuleStatus(response.data);
      } catch (error) {
        console.error('Failed to check module status:', error);
        setModuleStatus({ status: 'offline' });
      }
    };
    checkStatus();
  }, []);

  // Handle captured image
  const handleCapture = useCallback(async (imageData) => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    setStatus('processing');
    setResult(null);

    try {
      const response = await faceService.verifyFace(imageData);
      
      if (response.success && response.data?.user) {
        setStatus('success');
        setResult({
          user: response.data.user,
          confidence: response.data.user.confidence
        });

        // Call callback based on mode
        if (mode === 'entry' && onEntry) {
          onEntry(response.data.user);
        } else if (mode === 'exit' && onExit) {
          onExit(response.data.user);
        }
      } else {
        setStatus('error');
        setResult({
          message: response.message || '사용자를 찾을 수 없습니다.'
        });
      }
    } catch (error) {
      console.error('Face verification error:', error);
      setStatus('error');
      setResult({
        message: error.response?.data?.message || '인식 오류가 발생했습니다.'
      });
    } finally {
      // Delay before allowing next capture
      setTimeout(() => {
        processingRef.current = false;
      }, 2000);
    }
  }, [mode, onEntry, onExit]);

  // Handle camera error
  const handleCameraError = useCallback((error) => {
    setStatus('error');
    setResult({
      message: error
    });
  }, []);

  // Reset state
  const handleRetry = useCallback(() => {
    setStatus('idle');
    setResult(null);
    processingRef.current = false;
  }, []);

  return (
    <PanelContainer>
      <Title>안전체험관 입출입 시스템</Title>
      <Subtitle>얼굴을 카메라에 맞춰주세요</Subtitle>

      {moduleStatus && (
        <StatusIndicator>
          <StatusDot $online={moduleStatus.status === 'online'} />
          <span>
            {moduleStatus.status === 'online' 
              ? '안면인식 시스템 정상' 
              : '안면인식 시스템 오프라인'}
          </span>
        </StatusIndicator>
      )}

      <ModeSelector>
        <ModeButton
          $active={mode === 'entry'}
          onClick={() => { setMode('entry'); handleRetry(); }}
        >
          입장
        </ModeButton>
        <ModeButton
          $active={mode === 'exit'}
          onClick={() => { setMode('exit'); handleRetry(); }}
        >
          퇴장
        </ModeButton>
      </ModeSelector>

      <CameraSection>
        <CameraCapture
          onCapture={handleCapture}
          onError={handleCameraError}
          autoCapture={status === 'idle'}
          captureInterval={2000}
        />
      </CameraSection>

      {status !== 'idle' && (
        <ResultCard 
          $success={status === 'success'} 
          $error={status === 'error'}
          $processing={status === 'processing'}
        >
          {status === 'processing' && (
            <>
              <ResultIcon>🔍</ResultIcon>
              <ProcessingText>얼굴 인식 중...</ProcessingText>
            </>
          )}

          {status === 'success' && result && (
            <>
              <ResultIcon>✅</ResultIcon>
              <ResultTitle>{mode === 'entry' ? '입장 완료' : '퇴장 완료'}</ResultTitle>
              <ResultMessage>환영합니다!</ResultMessage>
              <UserInfo>
                <UserName>{result.user.user_name} 님</UserName>
                <UserDetail>신뢰도: {(result.confidence * 100).toFixed(1)}%</UserDetail>
                <UserDetail>아이디: {result.user.username}</UserDetail>
              </UserInfo>
            </>
          )}

          {status === 'error' && result && (
            <>
              <ResultIcon>❌</ResultIcon>
              <ResultTitle>인식 실패</ResultTitle>
              <ResultMessage>{result.message}</ResultMessage>
              <RetryButton onClick={handleRetry}>다시 시도</RetryButton>
            </>
          )}
        </ResultCard>
      )}
    </PanelContainer>
  );
};

export default FaceRecognitionPanel;