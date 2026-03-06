const Reservation = require('../models/Reservation');
const Program = require('../models/Program');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');

/**
 * 예약 서비스
 */
class ReservationService {
  /**
   * 내 예약 목록 조회
   * @param {number} userId - 사용자 ID
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 예약 목록
   */
  async getMyReservations(userId, options = {}) {
    const { page = 1, limit = 10, status = '' } = options;
    
    const { reservations, total } = await Reservation.findByUserId(userId, { page, limit, status });
    
    return {
      reservations: reservations.map(reservation => ({
        id: reservation.id,
        program_id: reservation.program_id,
        program_name: reservation.program_name,
        location: reservation.location,
        duration_minutes: reservation.duration_minutes,
        reservation_date: reservation.reservation_date,
        time_slot: reservation.time_slot,
        participant_count: reservation.participant_count,
        status: reservation.status,
        created_at: reservation.created_at
      })),
      total,
      page,
      limit
    };
  }

  /**
   * 예약 상세 조회
   * @param {number} reservationId - 예약 ID
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 예약 상세 정보
   */
  async getReservationById(reservationId, userId = null) {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new NotFoundError('예약을 찾을 수 없습니다.');
    }

    // 소유자 확인 (userId가 제공된 경우)
    if (userId && reservation.user_id !== userId) {
      throw new ForbiddenError('접근 권한이 없습니다.');
    }

    return {
      id: reservation.id,
      user_id: reservation.user_id,
      user_name: reservation.user_name,
      username: reservation.username,
      email: reservation.email,
      phone: reservation.phone,
      program_id: reservation.program_id,
      program_name: reservation.program_name,
      location: reservation.location,
      duration_minutes: reservation.duration_minutes,
      reservation_date: reservation.reservation_date,
      time_slot: reservation.time_slot,
      participant_count: reservation.participant_count,
      status: reservation.status,
      created_at: reservation.created_at,
      updated_at: reservation.updated_at
    };
  }

  /**
   * 예약 생성
   * @param {number} userId - 사용자 ID
   * @param {Object} reservationData - 예약 데이터
   * @returns {Promise<Object>} 생성된 예약
   */
  async createReservation(userId, reservationData) {
    // 프론트엔드 필드명을 백엔드 필드명으로 변환
    const program_id = reservationData.program_id || reservationData.programId;
    const reservation_date = reservationData.reservation_date || reservationData.reservedDate;
    const time_slot = reservationData.time_slot || reservationData.reservedTime;
    const participant_count = reservationData.participant_count || reservationData.participantCount || 1;

    // 프로그램 확인
    const program = await Program.findById(program_id);
    if (!program) {
      throw new NotFoundError('프로그램을 찾을 수 없습니다.');
    }

    if (!program.is_active) {
      throw new BadRequestError('비활성화된 프로그램입니다.');
    }

    // 예약 가능 인원 확인
    const reservedCount = await Program.getReservedCount(program_id, reservation_date, time_slot);
    const availableCount = program.capacity - reservedCount;

    if (participant_count > availableCount) {
      throw new BadRequestError(`예약 가능 인원을 초과했습니다. (가능: ${availableCount}명)`);
    }

    // 예약 생성
    const reservationId = await Reservation.create({
      user_id: userId,
      program_id,
      reservation_date,
      time_slot,
      participant_count
    });

    return this.getReservationById(reservationId);
  }

  /**
   * 예약 수정
   * @param {number} reservationId - 예약 ID
   * @param {number} userId - 사용자 ID
   * @param {Object} updateData - 수정할 데이터
   * @returns {Promise<Object>} 수정된 예약
   */
  async updateReservation(reservationId, userId, updateData) {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new NotFoundError('예약을 찾을 수 없습니다.');
    }

    // 소유자 확인
    if (reservation.user_id !== userId) {
      throw new ForbiddenError('수정 권한이 없습니다.');
    }

    // 이미 완료되거나 취소된 예약은 수정 불가
    if (['completed', 'cancelled'].includes(reservation.status)) {
      throw new BadRequestError('완료되거나 취소된 예약은 수정할 수 없습니다.');
    }

    // 날짜/시간/인원 변경 시 예약 가능 여부 확인
    if (updateData.reservation_date || updateData.time_slot || updateData.participant_count) {
      const newDate = updateData.reservation_date || reservation.reservation_date;
      const newTime = updateData.time_slot || reservation.time_slot;
      const newCount = updateData.participant_count || reservation.participant_count;

      const program = await Program.findById(reservation.program_id);
      const reservedCount = await Program.getReservedCount(
        reservation.program_id, 
        newDate, 
        newTime
      );

      // 현재 예약분은 제외
      const availableCount = program.capacity - reservedCount + reservation.participant_count;

      if (newCount > availableCount) {
        throw new BadRequestError(`예약 가능 인원을 초과했습니다. (가능: ${availableCount}명)`);
      }
    }

    await Reservation.update(reservationId, updateData);

    return this.getReservationById(reservationId);
  }

  /**
   * 예약 취소
   * @param {number} reservationId - 예약 ID
   * @param {number} userId - 사용자 ID
   * @returns {Promise<boolean>} 취소 성공 여부
   */
  async cancelReservation(reservationId, userId) {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new NotFoundError('예약을 찾을 수 없습니다.');
    }

    // 소유자 확인
    if (reservation.user_id !== userId) {
      throw new ForbiddenError('취소 권한이 없습니다.');
    }

    // 이미 완료되거나 취소된 예약은 취소 불가
    if (['completed', 'cancelled'].includes(reservation.status)) {
      throw new BadRequestError('완료되거나 이미 취소된 예약입니다.');
    }

    return Reservation.cancel(reservationId);
  }

  /**
   * 전체 예약 목록 조회 (관리자용)
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 예약 목록
   */
  async getAllReservations(options = {}) {
    const { page = 1, limit = 10, status = '', date = '', programId = '' } = options;
    
    const { reservations, total } = await Reservation.findAll({ page, limit, status, date, programId });
    
    return {
      reservations: reservations.map(reservation => ({
        id: reservation.id,
        user_id: reservation.user_id,
        user_name: reservation.user_name,
        username: reservation.username,
        email: reservation.email,
        phone: reservation.phone,
        program_id: reservation.program_id,
        program_name: reservation.program_name,
        location: reservation.location,
        reservation_date: reservation.reservation_date,
        time_slot: reservation.time_slot,
        participant_count: reservation.participant_count,
        status: reservation.status,
        created_at: reservation.created_at
      })),
      total,
      page,
      limit
    };
  }
}

module.exports = new ReservationService();