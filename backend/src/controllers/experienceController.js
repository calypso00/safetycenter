const experienceService = require('../services/experienceService');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

/**
 * 체험 컨트롤러
 */
class ExperienceController {
  /**
   * 입장 처리
   * POST /api/experiences/check-in
   */
  async checkIn(req, res, next) {
    try {
      const log = await experienceService.checkIn(req.body);
      return createdResponse(res, log, '입장 처리가 완료되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 퇴장 처리
   * POST /api/experiences/check-out
   */
  async checkOut(req, res, next) {
    try {
      const { log_id } = req.body;
      const log = await experienceService.checkOut(log_id);
      return successResponse(res, log, '퇴장 처리가 완료되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 내 체험 기록 목록
   * GET /api/experiences/my-logs
   */
  async getMyLogs(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await experienceService.getMyLogs(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      });
      
      return paginatedResponse(
        res,
        result.logs,
        result.page,
        result.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * 체험 통계 조회
   * GET /api/experiences/stats
   */
  async getStats(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      
      // 기본값: 최근 7일
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const stats = await experienceService.getStats(startDate, endDate);
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 일별 통계 조회
   * GET /api/experiences/stats/daily
   */
  async getDailyStats(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const stats = await experienceService.getDailyStats(startDate, endDate);
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 프로그램별 통계 조회
   * GET /api/experiences/stats/programs
   */
  async getProgramStats(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const stats = await experienceService.getProgramStats(startDate, endDate);
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 오늘의 체험 현황
   * GET /api/experiences/today
   */
  async getTodayStatus(req, res, next) {
    try {
      const status = await experienceService.getTodayStatus();
      return successResponse(res, status);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExperienceController();