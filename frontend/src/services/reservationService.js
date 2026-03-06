import api from './api';

const reservationService = {
  // 예약 목록 조회
  getReservations: async (params = {}) => {
    return api.get('/reservations', { params });
  },

  // 예약 생성
  createReservation: async (reservationData) => {
    return api.post('/reservations', reservationData);
  },

  // 예약 상세 조회
  getReservationById: async (id) => {
    return api.get(`/reservations/${id}`);
  },

  // 예약 수정
  updateReservation: async (id, reservationData) => {
    return api.put(`/reservations/${id}`, reservationData);
  },

  // 예약 취소
  cancelReservation: async (id) => {
    return api.delete(`/reservations/${id}`);
  },

  // 예약 가능 여부 확인
  checkAvailability: async (programId, date, time) => {
    return api.get('/reservations/check-availability', {
      params: { programId, date, time },
    });
  },

  // 내 예약 목록
  getMyReservations: async () => {
    return api.get('/users/reservations');
  },
};

export default reservationService;
