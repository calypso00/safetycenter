const adminService = require('../services/adminService');
const { successResponse, paginatedResponse } = require('../utils/response');

/**
 * 관리자 컨트롤러
 */
class AdminController {
  /**
   * 대시보드 데이터
   * GET /api/admin/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      const dashboard = await adminService.getDashboard();
      return successResponse(res, dashboard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 전체 통계
   * GET /api/admin/stats
   */
  async getStats(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      
      // 기본값: 최근 30일
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const stats = await adminService.getStats(startDate, endDate);
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 사용자 목록
   * GET /api/admin/users
   */
  async getUserList(req, res, next) {
    try {
      const { page, limit, search, role, is_active } = req.query;
      const result = await adminService.getUserList({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
        role,
        isActive: is_active === 'true' ? true : is_active === 'false' ? false : null
      });
      
      return paginatedResponse(
        res,
        result.users,
        result.page,
        result.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * 사용자 상세
   * GET /api/admin/users/:id
   */
  async getUserDetail(req, res, next) {
    try {
      const user = await adminService.getUserDetail(req.params.id);
      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 전체 예약 목록
   * GET /api/admin/reservations
   */
  async getReservationList(req, res, next) {
    try {
      const { page, limit, status, date, program_id } = req.query;
      const result = await adminService.getReservationList({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        date,
        programId: program_id
      });
      
      return paginatedResponse(
        res,
        result.reservations,
        result.page,
        result.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * 전체 체험 기록 목록
   * GET /api/admin/experiences
   */
  async getExperienceList(req, res, next) {
    try {
      const { page, limit, date, program_id, user_id } = req.query;
      const result = await adminService.getExperienceList({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        date,
        programId: program_id,
        userId: user_id
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
   * 일별 통계
   * GET /api/admin/stats/daily
   */
  async getDailyStats(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const stats = await adminService.getDailyStats(startDate, endDate);
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 프로그램별 통계
   * GET /api/admin/stats/programs
   */
  async getProgramStats(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const stats = await adminService.getProgramStats(startDate, endDate);
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();