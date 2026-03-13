import api from './api';

const adminService = {
  // 사용자 목록 조회
  getUsers: async (params = {}) => {
    return api.get('/admin/users', { params });
  },

  // 사용자 상세 조회
  getUserById: async (id) => {
    return api.get(`/admin/users/${id}`);
  },

  // 사용자 상태 변경
  updateUserStatus: async (id, status) => {
    return api.put(`/admin/users/${id}/status`, { status });
  },

  // 단일 사용자 생성 (회원 등록)
  createUser: async (userData) => {
    return api.post('/admin/users', userData);
  },

  // 단체 사용자 생성 (회원 등록)
  createBulkUsers: async (users) => {
    return api.post('/admin/users/bulk', { users });
  },

  // 전체 예약 조회
  getAllReservations: async (params = {}) => {
    return api.get('/admin/reservations', { params });
  },

  // 전체 체험 기록 조회
  getAllExperiences: async (params = {}) => {
    return api.get('/admin/experiences', { params });
  },

  // 대시보드 통계
  getDashboardStats: async () => {
    return api.get('/admin/statistics/dashboard');
  },

  // 일별 통계
  getDailyStats: async (params = {}) => {
    return api.get('/admin/statistics/daily', { params });
  },

  // 프로그램별 통계
  getProgramStats: async (params = {}) => {
    return api.get('/admin/statistics/programs', { params });
  },

  // 관리자 로그 조회
  getAdminLogs: async (params = {}) => {
    return api.get('/admin/logs', { params });
  },

  // 전체 통계 조회 (기간별)
  getStats: async (params = {}) => {
    return api.get('/admin/stats', { params });
  },
};

export default adminService;
