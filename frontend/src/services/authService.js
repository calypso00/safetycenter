import api from './api';

const authService = {
  // 회원가입
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  // 로그인
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.success && response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  // 로그아웃
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // 토큰 갱신
  refreshToken: async () => {
    return api.post('/auth/refresh');
  },

  // 내 정보 조회
  getMe: async () => {
    return api.get('/auth/me');
  },

  // 비밀번호 재설정 요청
  requestPasswordReset: async (email) => {
    return api.post('/auth/password/reset', { email });
  },

  // 비밀번호 재설정
  resetPassword: async (token, newPassword) => {
    return api.put('/auth/password/reset', { token, newPassword });
  },

  // 현재 사용자 정보 가져오기 (로컬 스토리지)
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // 로그인 여부 확인
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};

export default authService;
