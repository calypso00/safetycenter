import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Layout } from '../../components/layout';
import { Card, Button, Loading } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';
import adminService from '../../services/adminService';

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

const SidebarLink = styled(Link)`
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  color: ${({ $active }) => $active ? 'white' : '#94a3b8'};
  background-color: ${({ $active }) => $active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border-left: 3px solid ${({ $active }) => $active ? 'var(--primary-color)' : 'transparent'};
  transition: var(--transition);
  
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 1.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(Card)`
  padding: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminLayout = ({ children, activeMenu }) => {
  const { user } = useAuth();
  
  return (
    <PageContainer>
      <Sidebar>
        <SidebarTitle>관리자 메뉴</SidebarTitle>
        <SidebarNav>
          <SidebarLink to="/admin" $active={activeMenu === 'dashboard'}>
            📊 대시보드
          </SidebarLink>
          <SidebarLink to="/admin/users" $active={activeMenu === 'users'}>
            👥 사용자 관리
          </SidebarLink>
          <SidebarLink to="/admin/reservations" $active={activeMenu === 'reservations'}>
            📅 예약 관리
          </SidebarLink>
          <SidebarLink to="/admin/programs" $active={activeMenu === 'programs'}>
            🎯 프로그램 관리
          </SidebarLink>
          <SidebarLink to="/admin/board" $active={activeMenu === 'board'}>
            📝 게시판 관리
          </SidebarLink>
          <SidebarLink to="/admin/statistics" $active={activeMenu === 'statistics'}>
            📈 통계
          </SidebarLink>
        </SidebarNav>
      </Sidebar>
      <MainContent>{children}</MainContent>
    </PageContainer>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [programStats, setProgramStats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { isAdmin } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('관리자 권한이 필요합니다.');
      window.location.href = '/';
      return;
    }
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [dashboardRes, dailyRes, programRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getDailyStats({ days: 7 }),
        adminService.getProgramStats(),
      ]);
      
      if (dashboardRes.success) {
        setStats(dashboardRes.data);
      }
      if (dailyRes.success) {
        setDailyStats(dailyRes.data || []);
      }
      if (programRes.success) {
        setProgramStats(programRes.data || []);
      }
    } catch (error) {
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout hideHeader hideFooter>
        <AdminLayout>
          <Loading fullScreen text="데이터를 불러오는 중..." />
        </AdminLayout>
      </Layout>
    );
  }

  return (
    <Layout hideHeader hideFooter>
      <AdminLayout activeMenu="dashboard">
        <PageHeader>
          <PageTitle>관리자 대시보드</PageTitle>
          <Button onClick={fetchDashboardData}>새로고침</Button>
        </PageHeader>

        <StatsGrid>
          <StatCard>
            <StatValue>{stats?.totalUsers || 0}</StatValue>
            <StatLabel>전체 사용자</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats?.todayVisitors || 0}</StatValue>
            <StatLabel>금일 방문자</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats?.todayReservations || 0}</StatValue>
            <StatLabel>금일 예약</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats?.pendingReservations || 0}</StatValue>
            <StatLabel>대기중 예약</StatLabel>
          </StatCard>
        </StatsGrid>

        <ChartGrid>
          <ChartCard>
            <ChartTitle>일별 방문자 추이</ChartTitle>
            <LineChart width={400} height={250} data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="visitors" stroke="#2563eb" name="방문자" />
              <Line type="monotone" dataKey="reservations" stroke="#22c55e" name="예약" />
            </LineChart>
          </ChartCard>

          <ChartCard>
            <ChartTitle>프로그램별 이용 현황</ChartTitle>
            <BarChart width={400} height={250} data={programStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#2563eb" name="이용 횟수" />
            </BarChart>
          </ChartCard>
        </ChartGrid>

        <ChartGrid>
          <ChartCard>
            <ChartTitle>예약 상태 분포</ChartTitle>
            <PieChart width={400} height={250}>
              <Pie
                data={[
                  { name: '대기중', value: stats?.pendingReservations || 0 },
                  { name: '확정', value: stats?.confirmedReservations || 0 },
                  { name: '완료', value: stats?.completedReservations || 0 },
                  { name: '취소', value: stats?.cancelledReservations || 0 },
                ]}
                cx={200}
                cy={125}
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ChartCard>

          <ChartCard>
            <ChartTitle>최근 활동</ChartTitle>
            <div style={{ fontSize: '0.875rem' }}>
              {stats?.recentActivities?.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.75rem 0',
                    borderBottom: index < 4 ? '1px solid var(--border-color)' : 'none',
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{activity.action}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {activity.details} - {new Date(activity.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                  최근 활동이 없습니다.
                </div>
              )}
            </div>
          </ChartCard>
        </ChartGrid>
      </AdminLayout>
    </Layout>
  );
};

export default Dashboard;