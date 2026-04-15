const db = require('../config/database');

/**
 * AdminLog 모델
 * 관리자 로그 관리를 위한 데이터 접근 계층
 */
class AdminLog {
  /**
   * 로그 기록 생성
   * @param {Object} logData - 로그 데이터
   * @param {number} logData.adminId - 관리자 ID
   * @param {string} logData.action - 수행 작업
   * @param {string} logData.targetType - 대상 타입 (user, program, reservation, board)
   * @param {number} logData.targetId - 대상 ID
   * @param {string} logData.details - 상세 내용
   * @returns {Promise<Object>} 생성된 로그 정보
   */
  static async create({ adminId, action, targetType, targetId, details }) {
    const result = await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES (?, ?, ?, ?, ?)`,
      [adminId, action, targetType, targetId, details]
    );
    
    return {
      id: result.insertId,
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details
    };
  }

  /**
   * 로그 목록 조회
   * @param {Object} options - 조회 옵션
   * @param {number} options.page - 페이지 번호
   * @param {number} options.limit - 페이지당 개수
   * @param {number} options.adminId - 관리자 ID 필터
   * @param {string} options.action - 작업 타입 필터
   * @param {string} options.targetType - 대상 타입 필터
   * @param {string} options.startDate - 시작 날짜
   * @param {string} options.endDate - 종료 날짜
   * @returns {Promise<Object>} 로그 목록
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      adminId = null,
      action = null,
      targetType = null,
      startDate = null,
      endDate = null
    } = options;

    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (adminId) {
      conditions.push('al.admin_id = ?');
      params.push(adminId);
    }

    if (action) {
      conditions.push('al.action = ?');
      params.push(action);
    }

    if (targetType) {
      conditions.push('al.target_type = ?');
      params.push(targetType);
    }

    if (startDate) {
      conditions.push('al.created_at >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('al.created_at <= ?');
      params.push(endDate + ' 23:59:59');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 전체 개수 조회
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM admin_logs al ${whereClause}`,
      params
    );
    const total = countResult.total;

    // 목록 조회
    const logs = await db.query(
      `SELECT al.*, u.name as admin_name, u.username as admin_username
       FROM admin_logs al
       LEFT JOIN users u ON al.admin_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { logs, total };
  }

  /**
   * 특정 대상의 로그 목록 조회
   * @param {string} targetType - 대상 타입
   * @param {number} targetId - 대상 ID
   * @param {number} limit - 조회 개수
   * @returns {Promise<Array>} 로그 목록
   */
  static async findByTarget(targetType, targetId, limit = 10) {
    return await db.query(
      `SELECT al.*, u.name as admin_name, u.username as admin_username
       FROM admin_logs al
       LEFT JOIN users u ON al.admin_id = u.id
       WHERE al.target_type = ? AND al.target_id = ?
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [targetType, targetId, limit]
    );
  }

  /**
   * 특정 관리자의 로그 목록 조회
   * @param {number} adminId - 관리자 ID
   * @param {number} limit - 조회 개수
   * @returns {Promise<Array>} 로그 목록
   */
  static async findByAdminId(adminId, limit = 20) {
    return await db.query(
      `SELECT al.*, u.name as admin_name, u.username as admin_username
       FROM admin_logs al
       LEFT JOIN users u ON al.admin_id = u.id
       WHERE al.admin_id = ?
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [adminId, limit]
    );
  }

  /**
   * 로그 상세 조회
   * @param {number} id - 로그 ID
   * @returns {Promise<Object>} 로그 상세 정보
   */
  static async findById(id) {
    const [log] = await db.query(
      `SELECT al.*, u.name as admin_name, u.username as admin_username
       FROM admin_logs al
       LEFT JOIN users u ON al.admin_id = u.id
       WHERE al.id = ?`,
      [id]
    );
    return log;
  }

  /**
   * 로그 통게 조회
   * @param {string} startDate - 시작 날짜
   * @param {string} endDate - 종료 날짜
   * @returns {Promise<Object>} 로그 통계
   */
  static async getStats(startDate, endDate) {
    const params = [];
    const conditions = [];

    if (startDate) {
      conditions.push('created_at >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('created_at <= ?');
      params.push(endDate + ' 23:59:59');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 작업별 통계
    const byAction = await db.query(
      `SELECT action, COUNT(*) as count
       FROM admin_logs
       ${whereClause}
       GROUP BY action
       ORDER BY count DESC`,
      params
    );

    // 대상 타입별 통계
    const byTargetType = await db.query(
      `SELECT target_type, COUNT(*) as count
       FROM admin_logs
       ${whereClause}
       GROUP BY target_type
       ORDER BY count DESC`,
      params
    );

    // 전체 개수
    const [totalResult] = await db.query(
      `SELECT COUNT(*) as total FROM admin_logs ${whereClause}`,
      params
    );

    return {
      total: totalResult.total,
      by_action: byAction,
      by_target_type: byTargetType
    };
  }

  /**
   * 가능항 작업 타입 목록
   */
  static get ACTIONS() {
    return {
      // 사용자 관련
      USER_CREATE: 'USER_CREATE',
      USER_UPDATE: 'USER_UPDATE',
      USER_DELETE: 'USER_DELETE',
      USER_BULK_CREATE: 'USER_BULK_CREATE',
      
      // 예약 관련
      RESERVATION_UPDATE: 'RESERVATION_UPDATE',
      RESERVATION_CANCEL: 'RESERVATION_CANCEL',
      RESERVATION_CONFIRM: 'RESERVATION_CONFIRM',
      
      // 프로그램 관련
      PROGRAM_CREATE: 'PROGRAM_CREATE',
      PROGRAM_UPDATE: 'PROGRAM_UPDATE',
      PROGRAM_DELETE: 'PROGRAM_DELETE',
      PROGRAM_STATUS_CHANGE: 'PROGRAM_STATUS_CHANGE',
      
      // 게시판 관련
      BOARD_POST_DELETE: 'BOARD_POST_DELETE',
      BOARD_COMMENT_DELETE: 'BOARD_COMMENT_DELETE',
      BOARD_POST_ANSWER: 'BOARD_POST_ANSWER',
      
      // 시스템 관련
      SYSTEM_CONFIG: 'SYSTEM_CONFIG',
      DATA_EXPORT: 'DATA_EXPORT',
      DATA_BACKUP: 'DATA_BACKUP'
    };
  }

  /**
   * 가능항 대상 타입 목록
   */
  static get TARGET_TYPES() {
    return {
      USER: 'user',
      RESERVATION: 'reservation',
      PROGRAM: 'program',
      BOARD_POST: 'board_post',
      BOARD_COMMENT: 'board_comment',
      SYSTEM: 'system'
    };
  }
}

module.exports = AdminLog;
