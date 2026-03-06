import api from './api';

const programService = {
  // 프로그램 목록 조회
  getPrograms: async (params = {}) => {
    return api.get('/programs', { params });
  },

  // 프로그램 상세 조회
  getProgramById: async (id) => {
    return api.get(`/programs/${id}`);
  },

  // 예약 가능 시간 조회
  getAvailableSlots: async (programId, date) => {
    return api.get(`/programs/${programId}/slots`, { params: { date } });
  },

  // 프로그램 등록 (Admin)
  createProgram: async (programData) => {
    return api.post('/programs', programData);
  },

  // 프로그램 수정 (Admin)
  updateProgram: async (id, programData) => {
    return api.put(`/programs/${id}`, programData);
  },

  // 프로그램 삭제 (Admin)
  deleteProgram: async (id) => {
    return api.delete(`/programs/${id}`);
  },
};

export default programService;