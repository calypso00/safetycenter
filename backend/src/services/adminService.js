const User = require('../models/User');
const Reservation = require('../models/Reservation');
const ExperienceLog = require('../models/ExperienceLog');
const Program = require('../models/Program');
const { NotFoundError } = require('../utils/errors');

/**
 * 관리자 서비스
 */
class AdminService {
  /**
   * 대시보드 데이터 조회
   * @returns {Promise<Object>} 대시보드 데이터
   */
  async getDashboard() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // 오늘의 통계
    const todayVisitors = await ExperienceLog.countToday();
    const activeVisitors = await ExperienceLog.countActive();
    const todayReservations = await Reservation.getStats(todayStr, todayStr);

    // 전체 사용자 수
    const totalUsers = await User.count();

    // 전체 프로그램 수
    const programs = await Program.findAllActive();

    // 전체 예약 통계 (Dashboard에서 필요로 하는 필드)
    const allReservationStats = await Reservation.getStats('1970-01-01', todayStr);

    // 최근 활동 (체험 기록 + 예약에서 가져옴)
    const recentExperiences = await ExperienceLog.findAll({ page: 1, limit: 5 });
    const recentReservations = await Reservation.findAll({ page: 1, limit: 5 });

    // 최근 활동 데이터 구성
    const recentActivities = [
      ...recentExperiences.logs.map(log => ({
        action: '체험入场',
        details: `${log.user_name || log.username}님이 ${log.program_name} 프로그램 이용`,
        created_at: log.entry_time
      })),
      ...recentReservations.reservations.map(res => ({
        action: '예약',
        details: `${res.user_name || res.username}님이 ${res.program_name} 예약 (${res.status})`,
        created_at: res.created_at
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);

    // 최근 7일 통계
    const weeklyStats = await ExperienceLog.getStats(weekAgoStr, todayStr);
    const dailyStats = await ExperienceLog.getDailyStats(weekAgoStr, todayStr);

    return {
      // Dashboard.jsx에서 필요로 하는 필드명
      totalUsers: totalUsers,
      todayVisitors: todayVisitors,
      todayReservations: todayReservations.total_count || 0,
      pendingReservations: allReservationStats.pending_count || 0,
      confirmedReservations: allReservationStats.confirmed_count || 0,
      completedReservations: allReservationStats.completed_count || 0,
      cancelledReservations: allReservationStats.cancelled_count || 0,
      activeVisitors: activeVisitors,
      recentActivities: recentActivities,
      
      // 기존 구조도 유지 (하위 호환성)
      today: {
        visitors: todayVisitors,
        active_visitors: activeVisitors,
        reservations: todayReservations.total_count || 0,
        reservation_participants: todayReservations.total_participants || 0
      },
      totals: {
        users: totalUsers,
        programs: programs.length
      },
      weekly: {
        total_visits: weeklyStats.total_visits || 0,
        unique_visitors: weeklyStats.unique_visitors || 0,
        daily_stats: dailyStats
      }
    };
  }

  /**
   * 전체 통계 조회
   * @param {string} startDate - 시작 날짜
   * @param {string} endDate - 종료 날짜
   * @returns {Promise<Object>} 통계 데이터
   */
  async getStats(startDate, endDate) {
    const experienceStats = await ExperienceLog.getStats(startDate, endDate);
    const reservationStats = await Reservation.getStats(startDate, endDate);
    const dailyStats = await ExperienceLog.getDailyStats(startDate, endDate);
    const programStats = await ExperienceLog.getProgramStats(startDate, endDate);

    return {
      period: {
        start_date: startDate,
        end_date: endDate
      },
      experience: {
        total_visits: experienceStats.total_visits || 0,
        unique_visitors: experienceStats.unique_visitors || 0,
        avg_duration_seconds: Math.round(experienceStats.avg_duration) || 0,
        face_entry_count: experienceStats.face_entry_count || 0,
        manual_entry_count: experienceStats.manual_entry_count || 0
      },
      reservation: {
        total_count: reservationStats.total_count || 0,
        total_participants: reservationStats.total_participants || 0,
        pending_count: reservationStats.pending_count || 0,
        confirmed_count: reservationStats.confirmed_count || 0,
        cancelled_count: reservationStats.cancelled_count || 0,
        completed_count: reservationStats.completed_count || 0
      },
      daily_stats: dailyStats,
      program_stats: programStats
    };
  }

  /**
   * 사용자 목록 조회
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 사용자 목록
   */
  async getUserList(options = {}) {
    const { page = 1, limit = 10, search = '', role = '', isActive = null } = options;
    
    const { users, total } = await User.findAll({ page, limit, search, role, isActive });
    
    return {
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at
      })),
      total,
      page,
      limit
    };
  }

  /**
   * 사용자 상세 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 사용자 상세 정보
   */
  async getUserDetail(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }

    // 사용자의 예약 통계
    const reservations = await Reservation.findByUserId(userId, { limit: 5 });
    
    // 사용자의 체험 기록
    const experiences = await ExperienceLog.findByUserId(userId, { limit: 5 });

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      recent_reservations: reservations.reservations,
      recent_experiences: experiences.logs
    };
  }

  /**
   * 전체 예약 목록 조회
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 예약 목록
   */
  async getReservationList(options = {}) {
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

  /**
   * 전체 체험 기록 목록 조회
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 체험 기록 목록
   */
  async getExperienceList(options = {}) {
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
   * 프로그램별 통계 조회
   * @param {string} startDate - 시작 날짜
   * @param {string} endDate - 종료 날짜
   * @returns {Promise<Array>} 프로그램별 통계
   */
  async getProgramStats(startDate, endDate) {
    return await ExperienceLog.getProgramStats(startDate, endDate);
  }

  /**
   * 일별 통계 조회
   * @param {string} startDate - 시작 날짜
   * @param {string} endDate - 종료 날짜
   * @returns {Promise<Array>} 일별 통계
   */
  async getDailyStats(startDate, endDate) {
    return await ExperienceLog.getDailyStats(startDate, endDate);
  }
}

module.exports = new AdminService();