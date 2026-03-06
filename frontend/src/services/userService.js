import api from './api';

const userService = {
  // 내 프로필 조회
  getProfile: async () => {
    return api.get('/users/profile');
  },

  // 프로필 수정
  updateProfile: async (profileData) => {
    return api.put('/users/profile', profileData);
  },

  // 계정 탈퇴
  deleteAccount: async () => {
    return api.delete('/users/account');
  },

  // 내 예약 목록
  getMyReservations: async () => {
    return api.get('/users/reservations');
  },

  // 내 체험 기록
  getMyExperiences: async () => {
    return api.get('/users/experiences');
  },
};

export default userService;
