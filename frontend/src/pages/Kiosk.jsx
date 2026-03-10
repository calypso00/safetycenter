import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { FaceRecognitionPanel } from '../components/kiosk';
import experienceService from '../services/experienceService';
import { useAuth } from '../store/AuthContext';

const KioskContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0;
`;

const DateTime = styled.div`
  text-align: right;
  color: #a0a0a0;
`;

const DateText = styled.p`
  font-size: 14px;
  margin: 0;
`;

const TimeText = styled.p`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #fff;
`;

const Content = styled.div`
  padding: 20px;
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.p`
  font-size: 32px;
  font-weight: 700;
  color: #4CAF50;
  margin: 0;
`;

const StatLabel = styled.p`
  font-size: 14px;
  color: #a0a0a0;
  margin: 5px 0 0;
`;

const LoginPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  color: #fff;
  text-align: center;
`;

const LoginTitle = styled.h2`
  font-size: 28px;
  margin-bottom: 20px;
`;

const LoginText = styled.p`
  font-size: 16px;
  color: #a0a0a0;
  margin-bottom: 30px;
`;

const LoginButton = styled.button`
  padding: 15px 40px;
  font-size: 18px;
  font-weight: 600;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #45a049;
  }
`;

/**
 * Kiosk Page - Face recognition entry/exit system
 */
const Kiosk = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    todayVisitors: 0,
    currentInside: 0
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await experienceService.getTodayStats();
        if (response.success) {
          setStats({
            todayVisitors: response.data.total_entries || 0,
            currentInside: response.data.current_inside || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Handle entry
  const handleEntry = useCallback(async (userData) => {
    try {
      await experienceService.recordEntry({
        user_id: userData.user_id,
        entry_method: 'face'
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        todayVisitors: prev.todayVisitors + 1,
        currentInside: prev.currentInside + 1
      }));
    } catch (error) {
      console.error('Failed to record entry:', error);
    }
  }, []);

  // Handle exit
  const handleExit = useCallback(async (userData) => {
    try {
      await experienceService.recordExit(userData.user_id);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        currentInside: Math.max(0, prev.currentInside - 1)
      }));
    } catch (error) {
      console.error('Failed to record exit:', error);
    }
  }, []);

  // Format date
  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return date.toLocaleDateString('ko-KR', options);
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <KioskContainer>
      <Header>
        <Logo>🛡️ 안전체험관</Logo>
        <DateTime>
          <DateText>{formatDate(currentTime)}</DateText>
          <TimeText>{formatTime(currentTime)}</TimeText>
        </DateTime>
      </Header>

      <Content>
        <StatsBar>
          <StatItem>
            <StatValue>{stats.todayVisitors}</StatValue>
            <StatLabel>금일 방문자</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.currentInside}</StatValue>
            <StatLabel>현재 체험 중</StatLabel>
          </StatItem>
        </StatsBar>

        <FaceRecognitionPanel
          onEntry={handleEntry}
          onExit={handleExit}
        />
      </Content>
    </KioskContainer>
  );
};

export default Kiosk;