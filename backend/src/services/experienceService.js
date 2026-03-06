const ExperienceLog = require('../models/ExperienceLog');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Program = require('../models/Program');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * 체험 서비스
 */
class ExperienceService {
  /**
   * 입장 처리
   * @param {Object} entryData - 입장 데이터
   * @returns {Promise<Object>} 생성된 체험 기록
   */
  async checkIn(entryData) {
    const { user_id, program_id, reservation_id, entry_method = 'face', notes = null } = entryData;

    // 사용자 확인
    const user = await User.findById(user_id);
    if (!user || !user.is_active) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }

    // 프로그램 확인
    const program = await Program.findById(program_id);
    if (!program || !program.is_active) {
      throw new NotFoundError('프로그램을 찾을 수 없습니다.');
    }

    // 이미 체험 중인지 확인
    const activeLog = await ExperienceLog.findActiveByUserId(user_id);
    if (activeLog) {
      throw new BadRequestError('이미 체험 중인 사용자입니다. 먼저 퇴장 처리를 해주세요.');
    }

    // 예약 확인 (예약 ID가 제공된 경우)
    if (reservation_id) {
      const reservation = await Reservation.findById(reservation_id);
      if (!reservation) {
        throw new NotFoundError('예약을 찾을 수 없습니다.');
      }
      if (reservation.user_id !== user_id) {
        throw new BadRequestError('예약자와 일치하지 않습니다.');
      }
      if (reservation.status === 'cancelled') {
        throw new BadRequestError('취소된 예약입니다.');
      }
    }

    // 체험 기록 생성
    const logId = await ExperienceLog.create({
      user_id,
      program_id,
      reservation_id,
      entry_method,
      notes
    });

    // 예약 상태 업데이트
    if (reservation_id) {
      await Reservation.updateStatus(reservation_id, 'confirmed');
    }

    return this.getExperienceById(logId);
  }

  /**
   * 퇴장 처리
   * @param {number} logId - 체험 기록 ID
   * @returns {Promise<Object>} 업데이트된 체험 기록
   */
  async checkOut(logId) {
    const log = await ExperienceLog.findById(logId);
    if (!log) {
      throw new NotFoundError('체험 기록을 찾을 수 없습니다.');
    }

    if (log.exit_time) {
      throw new BadRequestError('이미 퇴장 처리된 기록입니다.');
    }

    await ExperienceLog.checkOut(logId);

    // 예약 상태 완료로 변경
    if (log.reservation_id) {
      await Reservation.updateStatus(log.reservation_id, 'completed');
    }

    return this.getExperienceById(logId);
  }

  /**
   * 체험 기록 상세 조회
   * @param {number} logId - 체험 기록 ID
   * @returns {Promise<Object>} 체험 기록 상세
   */
  async getExperienceById(logId) {
    const log = await ExperienceLog.findById(logId);
    if (!log) {
      throw new NotFoundError('체험 기록을 찾을 수 없습니다.');
    }

    return {
      id: log.id,
      user_id: log.user_id,
      user_name: log.user_name,
      username: log.username,
      program_id: log.program_id,
      program_name: log.program_name,
      reservation_id: log.reservation_id,
      entry_time: log.entry_time,
      exit_time: log.exit_time,
      duration_seconds: log.duration_seconds,
      entry_method: log.entry_method,
      notes: log.notes,
      created_at: log.created_at
    };
  }

  /**
   * 내 체험 기록 목록 조회
   * @param {number} userId - 사용자 ID
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 체험 기록 목록
   */
  async getMyLogs(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    
    const { logs, total } = await ExperienceLog.findByUserId(userId, { page, limit });
    
    return {
      logs: logs.map(log => ({
        id: log.id,
        program_id: log.program_id,
        program_name: log.program_name,
        location: log.location,
        entry_time: log.entry_time,
        exit_time: log.exit_time,
        duration_seconds: log.duration_seconds,
        entry_method: log.entry_method
      })),
      total,
      page,
      limit
    };
  }

  /**
   * 체험 통계 조회
   * @param {string} startDate - 시작 날짜
   * @param {string} endDate - 종료 날짜
   * @returns {Promise<Object>} 통계 데이터
   */
  async getStats(startDate, endDate) {
    const stats = await ExperienceLog.getStats(startDate, endDate);
    
    return {
      total_visits: stats.total_visits || 0,
      unique_visitors: stats.unique_visitors || 0,
      avg_duration_seconds: Math.round(stats.avg_duration) || 0,
      avg_duration_minutes: Math.round((stats.avg_duration || 0) / 60),
      face_entry_count: stats.face_entry_count || 0,
      manual_entry_count: stats.manual_entry_count || 0
    };
  }

  /**
   * 일별 통계 조회
   * @param {string} startDate - 시작 날짜
   * @param {string} endDate - 종료 날짜
   * @returns {Promise<Array>} 일별 통계
   */
  async getDailyStats(startDate, endDate) {
    const stats = await ExperienceLog.getDailyStats(startDate, endDate);
    
    return stats.map(stat => ({
      date: stat.date,
      visit_count: stat.visit_count,
      unique_visitors: stat.unique_visitors,
      avg_duration_seconds: Math.round(stat.avg_duration) || 0,
      avg_duration_minutes: Math.round((stat.avg_duration || 0) / 60)
    }));
  }

  /**
   * 프로그램별 통계 조회
   * @param {string} startDate - 시작 날짜
   * @param {string} endDate - 종료 날짜
   * @returns {Promise<Array>} 프로그램별 통계
   */
  async getProgramStats(startDate, endDate) {
    const stats = await ExperienceLog.getProgramStats(startDate, endDate);
    
    return stats.map(stat => ({
      program_id: stat.program_id,
      program_name: stat.program_name,
      visit_count: stat.visit_count,
      unique_visitors: stat.unique_visitors,
      avg_duration_seconds: Math.round(stat.avg_duration) || 0,
      avg_duration_minutes: Math.round((stat.avg_duration || 0) / 60)
    }));
  }

  /**
   * 전체 체험 기록 목록 조회 (관리자용)
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 체험 기록 목록
   */
  async getAllExperiences(options = {}) {
    const { page = 1, limit = 10, date = '', programId = '', userId = '' } = options;
    
    const { logs, total } = await ExperienceLog.findAll({ page, limit, date, programId, userId });
    
    return {
      logs: logs.map(log => ({
        id: log.id,
        user_id: log.user_id,
        user_name: log.user_name,
        username: log.username,
        program_id: log.program_id,
        program_name: log.program_name,
        location: log.location,
        entry_time: log.entry_time,
        exit_time: log.exit_time,
        duration_seconds: log.duration_seconds,
        entry_method: log.entry_method,
        notes: log.notes
      })),
      total,
      page,
      limit
    };
  }

  /**
   * 오늘의 체험 현황
   * @returns {Promise<Object>} 오늘의 체험 현황
   */
  async getTodayStatus() {
    const todayVisitors = await ExperienceLog.countToday();
    const activeVisitors = await ExperienceLog.countActive();
    const activeList = await ExperienceLog.findActive();

    return {
      today_visitors: todayVisitors,
      active_visitors: activeVisitors,
      active_list: activeList.map(log => ({
        id: log.id,
        user_id: log.user_id,
        user_name: log.user_name,
        program_name: log.program_name,
        entry_time: log.entry_time
      }))
    };
  }
}

module.exports = new ExperienceService();