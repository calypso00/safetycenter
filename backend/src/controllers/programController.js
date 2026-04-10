const programService = require('../services/programService');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

/**
 * 프로그램 컨트롤러
 */
class ProgramController {
  /**
   * 프로그램 목록 조회
   * GET /api/programs
   */
  async getPrograms(req, res, next) {
    try {
      const { page, limit, is_active, search } = req.query;
      const result = await programService.getPrograms({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        isActive: is_active === 'false' ? false : is_active === 'true' ? true : is_active === 'null' || is_active === '' ? null : true,
        search: search || ''
      });
      
      return paginatedResponse(
        res,
        result.programs,
        result.page,
        result.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * 프로그램 상세 조회
   * GET /api/programs/:id
   */
  async getProgramById(req, res, next) {
    try {
      const program = await programService.getProgramById(req.params.id);
      return successResponse(res, program);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 예약 가능 시간 조회
   * GET /api/programs/:id/slots
   */
  async getAvailableSlots(req, res, next) {
    try {
      const { date } = req.query;
      const slots = await programService.getAvailableSlots(req.params.id, date);
      return successResponse(res, slots);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 프로그램 생성 (관리자용)
   * POST /api/programs
   */
  async createProgram(req, res, next) {
    try {
      const programData = { ...req.body };
      
      // 업로드된 이미지가 있으면 경로 추가
      if (req.file) {
        programData.thumbnail = `/uploads/programs/${req.file.filename}`;
      }
      
      const program = await programService.createProgram(programData);
      return createdResponse(res, program, '프로그램이 생성되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 프로그램 수정 (관리자용)
   * PUT /api/programs/:id
   */
  async updateProgram(req, res, next) {
    try {
      const updateData = { ...req.body };
      
      // 업로드된 이미지가 있으면 경로 추가
      if (req.file) {
        updateData.thumbnail = `/uploads/programs/${req.file.filename}`;
      }
      
      const program = await programService.updateProgram(req.params.id, updateData);
      return successResponse(res, program, '프로그램이 수정되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 프로그램 삭제 (관리자용)
   * DELETE /api/programs/:id
   */
  async deleteProgram(req, res, next) {
    try {
      await programService.deleteProgram(req.params.id);
      return successResponse(res, null, '프로그램이 삭제되었습니다.');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProgramController();