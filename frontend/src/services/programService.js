import api from './api';

const programService = {
  // 프로그램 목록 조회
  getPrograms: async (params = {}) => {
    const { page = 1, limit = 9, ...restParams } = params;
    return api.get('/programs', {
      params: {
        page,
        limit,
        ...restParams
      }
    });
  },

  // 모든 프로그램 목록 조회 (페이지네이션 없이)
  getAllPrograms: async (params = {}) => {
    return api.get('/programs', {
      params: {
        page: 1,
        limit: 100,
        ...params
      }
    });
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
    const isFormData = programData instanceof FormData;
    return api.post('/programs', programData, {
      headers: isFormData ? { 'Content-Type': undefined } : {}
    });
  },

  // 프로그램 수정 (Admin)
  updateProgram: async (id, programData) => {
    const isFormData = programData instanceof FormData;
    return api.put(`/programs/${id}`, programData, {
      headers: isFormData ? { 'Content-Type': undefined } : {}
    });
  },

  // 프로그램 삭제 (Admin)
  deleteProgram: async (id) => {
    return api.delete(`/programs/${id}`);
  },
};

export default programService;
