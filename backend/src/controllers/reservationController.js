const reservationService = require('../services/reservationService');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

/**
 * 예약 컨트롤러
 */
class ReservationController {
  /**
   * 내 예약 목록 조회
   * GET /api/reservations
   */
  async getMyReservations(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await reservationService.getMyReservations(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status
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
   * 예약 상세 조회
   * GET /api/reservations/:id
   */
  async getReservationById(req, res, next) {
    try {
      const reservation = await reservationService.getReservationById(
        req.params.id,
        req.user.id
      );
      return successResponse(res, reservation);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 예약 생성
   * POST /api/reservations
   */
  async createReservation(req, res, next) {
    try {
      const reservation = await reservationService.createReservation(req.user.id, req.body);
      return createdResponse(res, reservation, '예약이 완료되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 예약 수정
   * PUT /api/reservations/:id
   */
  async updateReservation(req, res, next) {
    try {
      const reservation = await reservationService.updateReservation(
        req.params.id,
        req.user.id,
        req.body
      );
      return successResponse(res, reservation, '예약이 수정되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 예약 취소
   * DELETE /api/reservations/:id
   */
  async cancelReservation(req, res, next) {
    try {
      await reservationService.cancelReservation(req.params.id, req.user.id);
      return successResponse(res, null, '예약이 취소되었습니다.');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReservationController();