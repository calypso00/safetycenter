import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
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
  color: ${({ $active }) => ($active ? 'white' : '#94a3b8')};
  background-color: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  border-left: 3px solid ${({ $active }) => ($active ? 'var(--primary-color)' : 'transparent')};
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
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const DateRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const DateInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  color: var(--text-primary);
  background-color: var(--bg-primary);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const DateLabel = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

const TableCard = styled(Card)`
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const TableHead = styled.thead`
  background-color: var(--bg-secondary);
`;

const TableHeader = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:hover {
    background-color: var(--bg-secondary);
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'completed':
        return '#dcfce7';
      case 'active':
        return '#dbeafe';
      case 'cancelled':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'completed':
        return '#166534';
      case 'active':
        return '#1e40af';
      case 'cancelled':
        return '#991b1b';
      default:
        return '#374151';
    }
  }};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  background-color: ${({ $active }) => ($active ? 'var(--primary-color)' : 'var(--bg-primary)')};
  color: ${({ $active }) => ($active ? 'white' : 'var(--text-primary)')};
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.875rem;
  transition: var(--transition);

  &:hover:not(:disabled) {
    background-color: ${({ $active }) => ($active ? 'var(--primary-dark)' : 'var(--bg-secondary)')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
const PIE_COLORS = ['#f59e0b', '#2563eb', '#22c55e', '#ef4444'];

const AdminLayout = ({ children, activeMenu }) => {
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

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [programStats, setProgramStats] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [experiencePagination, setExperiencePagination] = useState({
    page: 1,
    total: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { isAdmin } = useAuth();
  const toast = useToast();

  // 기본 기간 설정 (최근 30일)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('관리자 권한이 필요합니다.');
      window.location.href = '/';
      return;
    }
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchStatisticsData();
    }
  }, [startDate, endDate]);

  const fetchStatisticsData = async () => {
    try {
      setLoading(true);

      const [statsRes, dailyRes, programRes, experiencesRes] = await Promise.all([
        adminService.getStats({ start_date: startDate, end_date: endDate }),
        adminService.getDailyStats({ start_date: startDate, end_date: endDate }),
        adminService.getProgramStats({ start_date: startDate, end_date: endDate }),
        adminService.getAllExperiences({ page: experiencePagination.page, limit: experiencePagination.limit }),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (dailyRes.success) {
        setDailyStats(dailyRes.data || []);
      }
      if (programRes.success) {
        setProgramStats(programRes.data || []);
      }
      if (experiencesRes.success) {
        setExperiences(experiencesRes.data?.logs || []);
        setExperiencePagination((prev) => ({
          ...prev,
          total: experiencesRes.data?.total || 0,
        }));
      }
    } catch (error) {
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setExperiencePagination((prev) => ({ ...prev, page: newPage }));
    fetchExperiences(newPage);
  };

  const fetchExperiences = async (page) => {
    try {
      const res = await adminService.getAllExperiences({
        page,
        limit: experiencePagination.limit,
      });
      if (res.success) {
        setExperiences(res.data?.logs || []);
        setExperiencePagination((prev) => ({
          ...prev,
          total: res.data?.total || 0,
        }));
      }
    } catch (error) {
      toast.error('체험 기록을 불러오는데 실패했습니다.');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}분 ${remainingSeconds}초`;
    }
    return `${remainingSeconds}초`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'active':
        return '진행중';
      case 'cancelled':
        return '취소';
      default:
        return '알 수 없음';
    }
  };

  const getEntryMethodText = (method) => {
    switch (method) {
      case 'face':
        return '얼굴인식';
      case 'manual':
        return '수동입력';
      default:
        return method;
    }
  };

  // 예약 상태 분포 데이터
  const reservationStatusData = stats
    ? [
        { name: '대기중', value: stats.reservation?.pending_count || 0 },
        { name: '확정', value: stats.reservation?.confirmed_count || 0 },
        { name: '완료', value: stats.reservation?.completed_count || 0 },
        { name: '취소', value: stats.reservation?.cancelled_count || 0 },
      ]
    : [];

  const totalPages = Math.ceil(experiencePagination.total / experiencePagination.limit);

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
      <AdminLayout activeMenu="statistics">
        <PageHeader>
          <PageTitle>통계 분석</PageTitle>
          <DateRangeContainer>
            <DateLabel>기간:</DateLabel>
            <DateInput
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <DateLabel>~</DateLabel>
            <DateInput
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button onClick={fetchStatisticsData} size="small">
              조회
            </Button>
          </DateRangeContainer>
        </PageHeader>

        {/* 종합 통계 카드 */}
        <StatsGrid>
          <StatCard>
            <StatValue>{stats?.experience?.total_visits || 0}</StatValue>
            <StatLabel>총 방문자</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats?.experience?.unique_visitors || 0}</StatValue>
            <StatLabel>고유 방문자</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats?.reservation?.total_count || 0}</StatValue>
            <StatLabel>총 예약수</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats?.reservation?.completed_count || 0}</StatValue>
            <StatLabel>체험 완료</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>
              {stats?.experience?.avg_duration_seconds
                ? `${Math.floor(stats.experience.avg_duration_seconds / 60)}분`
                : '0분'}
            </StatValue>
            <StatLabel>평균 체험 시간</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* 차트 영역 */}
        <ChartGrid>
          {/* 일별 방문자/예약 추이 차트 */}
          <ChartCard>
            <ChartTitle>일별 방문자/예약 추이</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('ko-KR');
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="visits"
                  stroke="#2563eb"
                  name="방문자"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="unique_visitors"
                  stroke="#22c55e"
                  name="고유 방문자"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 프로그램별 이용률 차트 */}
          <ChartCard>
            <ChartTitle>프로그램별 이용률</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={programStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="program_name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="visit_count" fill="#2563eb" name="방문 횟수" />
                <Bar dataKey="unique_visitors" fill="#22c55e" name="고유 방문자" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </ChartGrid>

        {/* 예약 상태 분포 차트 */}
        <ChartGrid>
          <ChartCard>
            <ChartTitle>예약 상태 분포</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reservationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reservationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 체험 기록 요약 */}
          <ChartCard>
            <ChartTitle>체험 기록 요약</ChartTitle>
            <div style={{ padding: '1rem 0' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>얼굴인식 입장</span>
                <span style={{ fontWeight: 600 }}>{stats?.experience?.face_entry_count || 0}회</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>수동 입력</span>
                <span style={{ fontWeight: 600 }}>
                  {stats?.experience?.manual_entry_count || 0}회
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>총 예약 인원</span>
                <span style={{ fontWeight: 600 }}>
                  {stats?.reservation?.total_participants || 0}명
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>조회 기간</span>
                <span style={{ fontWeight: 600 }}>
                  {stats?.period?.start_date} ~ {stats?.period?.end_date}
                </span>
              </div>
            </div>
          </ChartCard>
        </ChartGrid>

        {/* 체험 기록 데이터 테이블 */}
        <TableCard>
          <ChartTitle>체험 기록 목록</ChartTitle>
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>ID</TableHeader>
                  <TableHeader>사용자</TableHeader>
                  <TableHeader>프로그램</TableHeader>
                  <TableHeader>입장 시간</TableHeader>
                  <TableHeader>퇴장 시간</TableHeader>
                  <TableHeader>체험 시간</TableHeader>
                  <TableHeader>입장 방식</TableHeader>
                  <TableHeader>상태</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {experiences.length > 0 ? (
                  experiences.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell>{exp.id}</TableCell>
                      <TableCell>{exp.user_name || exp.username || '-'}</TableCell>
                      <TableCell>{exp.program_name || '-'}</TableCell>
                      <TableCell>{formatDateTime(exp.entry_time)}</TableCell>
                      <TableCell>{formatDateTime(exp.exit_time)}</TableCell>
                      <TableCell>{formatDuration(exp.duration_seconds)}</TableCell>
                      <TableCell>{getEntryMethodText(exp.entry_method)}</TableCell>
                      <TableCell>
                        <StatusBadge $status={exp.status}>
                          {getStatusText(exp.status)}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                      체험 기록이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <PaginationContainer>
              <PageButton
                onClick={() => handlePageChange(experiencePagination.page - 1)}
                disabled={experiencePagination.page === 1}
              >
                이전
              </PageButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PageButton
                  key={page}
                  $active={page === experiencePagination.page}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </PageButton>
              ))}
              <PageButton
                onClick={() => handlePageChange(experiencePagination.page + 1)}
                disabled={experiencePagination.page === totalPages}
              >
                다음
              </PageButton>
            </PaginationContainer>
          )}
        </TableCard>
      </AdminLayout>
    </Layout>
  );
};

export default Statistics;
