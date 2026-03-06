const db = require('../config/database');

/**
 * 체험 기록 모델
 */
class ExperienceLog {
  /**
   * 체험 기록 생성 (입장)
   * @param {Object} logData - 체험 기록 데이터
   * @returns {Promise<number>} 생성된 기록 ID
   */
  static async create(logData) {
    const { user_id, program_id, reservation_id, entry_method = 'face', notes = null } = logData;
    
    const result = await db.query(
      `INSERT INTO experience_logs (user_id, program_id, reservation_id, entry_time, entry_method, notes)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [user_id, program_id, reservation_id, entry_method, notes]
    );
    
    return result.insertId;
  }

  /**
   * ID로 체험 기록 조회
   * @param {number} id - 기록 ID
   * @returns {Promise<Object|null>} 체험 기록 정보
   */
  static async findById(id) {
    const logs = await db.query(
      `SELECT e.*, p.name as program_name, u.name as user_name, u.username
       FROM experience_logs e
       JOIN programs p ON e.program_id = p.id
       JOIN users u ON e.user_id = u.id
       WHERE e.id = ?`,
      [id]
    );
    return logs.length > 0 ? logs[0] : null;
  }

  /**
   * 퇴장 처리
   * @param {number} id - 기록 ID
   * @returns {Promise<boolean>} 처리 성공 여부
   */
  static async checkOut(id) {
    // 먼저 입장 기록 조회
    const log = await this.findById(id);
    if (!log || log.exit_time) {
      return false;
    }

    const now = new Date();
    const entryTime = new Date(log.entry_time);
    const durationSeconds = Math.floor((now - entryTime) / 1000);

    const result = await db.query(
      `UPDATE experience_logs 
       SET exit_time = NOW(), duration_seconds = ? 
       WHERE id = ? AND exit_time IS NULL`,
      [durationSeconds, id]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * 사용자의 체험 기록 목록 조회
   * @param {number} userId - 사용자 ID
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 체험 기록 목록과 전체 개수
   */
  static async findByUserId(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    // page와 limit을 정수로 변환 (쿼리 파라미터는 문자열로 전달될 수 있음)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    // 전체 개수 조회
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM experience_logs WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0].total;

    // 목록 조회
    // LIMIT/OFFSET은 prepared statement에서 정수 타입으로 처리되므로 SQL에 직접 포함
    const logs = await db.query(
      `SELECT e.*, p.name as program_name, p.location
       FROM experience_logs e
       JOIN programs p ON e.program_id = p.id
       WHERE e.user_id = ?
       ORDER BY e.entry_time DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      [userId]
    );

    return { logs, total };
  }

  /**
   * 전체 체험 기록 목록 조회 (관리자용)
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 체험 기록 목록과 전체 개수
   */
  static async findAll(options = {}) {
    const { page = 1, limit = 10, date = '', programId = '', userId = '' } = options;
    // page와 limit을 정수로 변환 (쿼리 파라미터는 문자열로 전달될 수 있음)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (date) {
      whereClause += ' AND DATE(e.entry_time) = ?';
      params.push(date);
    }

    if (programId) {
      whereClause += ' AND e.program_id = ?';
      params.push(programId);
    }

    if (userId) {
      whereClause += ' AND e.user_id = ?';
      params.push(userId);
    }

    // 전체 개수 조회
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM experience_logs e ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 목록 조회
    // LIMIT/OFFSET은 prepared statement에서 정수 타입으로 처리되므로 SQL에 직접 포함
    const logs = await db.query(
      `SELECT e.*, p.name as program_name, p.location,
              u.name as user_name, u.username
       FROM experience_logs e
       JOIN programs p ON e.program_id = p.id
       JOIN users u ON e.user_id = u.id
       ${whereClause}
       ORDER BY e.entry_time DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      params
    );

    return { logs, total };
  }

  /**
   * 오늘의 체험자 목록 조회
   * @returns {Promise<Array>} 체험자 목록
   */
  static async findToday() {
    return await db.query(
      `SELECT e.*, p.name as program_name, u.name as user_name, u.username
       FROM experience_logs e
       JOIN programs p ON e.program_id = p.id
       JOIN users u ON e.user_id = u.id
       WHERE DATE(e.entry_time) = CURDATE()
       ORDER BY e.entry_time DESC`
    );
  }

  /**
   * 현재 체험 중인 사용자 목록
   * @returns {Promise<Array>} 체험 중인 사용자 목록
   */
  static async findActive() {
    return await db.query(
      `SELECT e.*, p.name as program_name, u.name as user_name, u.username
       FROM experience_logs e
       JOIN programs p ON e.program_id = p.id
       JOIN users u ON e.user_id = u.id
       WHERE e.exit_time IS NULL
       ORDER BY e.entry_time ASC`
    );
  }

  /**
   * 사용자의 미종료 체험 기록 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object|null>} 미종료 체험 기록
   */
  static async findActiveByUserId(userId) {
    const logs = await db.query(
      `SELECT e.*, p.name as program_name
       FROM experience_logs e
       JOIN programs p ON e.program_id = p.id
       WHERE e.user_id = ? AND e.exit_time IS NULL
       ORDER BY e.entry_time DESC
       LIMIT 1`,
      [userId]
    );
    return logs.length > 0 ? logs[0] : null;
  }

  /**
   * 체험 통계 조회
   * @param {string} startDate - 시작 날짜
   * @param {string} endDate - 종료 날짜
   * @returns {Promise<Object>} 통계 데이터
   */
  static async getStats(startDate, endDate) {
    const result = await db.query(
      `SELECT 
         COUNT(*) as total_visits,
         COUNT(DISTINCT user_id) as unique_visitors,
         AVG(duration_seconds) as avg_duration,
         SUM(CASE WHEN entry_method = 'face' THEN 1 ELSE 0 END) as face_entry_count,
         SUM(CASE WHEN entry_method = 'manual' THEN 1 ELSE 0 END) as manual_entry_count
       FROM experience_logs
       WHERE DATE(entry_time) BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    return result[0];
  }

  /**
   * 일별 체험 통계 조회
   * @param {string} startDate - 시작 날짜
   * @param {string} endDate - 종료 날짜
   * @returns {Promise<Array>} 일별 통계 데이터
   */
  static async getDailyStats(startDate, endDate) {
    return await db.query(
      `SELECT 
         DATE(entry_time) as date,
         COUNT(*) as visit_count,
         COUNT(DISTINCT user_id) as unique_visitors,
         AVG(duration_seconds) as avg_duration
       FROM experience_logs
       WHERE DATE(entry_time) BETWEEN ? AND ?
       GROUP BY DATE(entry_time)
       ORDER BY date ASC`,
      [startDate, endDate]
    );
  }

  /**
   * 프로그램별 체험 통계 조회
   * @param {string} startDate - 시작 날짜
   * @param {string} endDate - 종료 날짜
   * @returns {Promise<Array>} 프로그램별 통계 데이터
   */
  static async getProgramStats(startDate, endDate) {
    return await db.query(
      `SELECT 
         p.id as program_id,
         p.name as program_name,
         COUNT(*) as visit_count,
         COUNT(DISTINCT e.user_id) as unique_visitors,
         AVG(e.duration_seconds) as avg_duration
       FROM experience_logs e
       JOIN programs p ON e.program_id = p.id
       WHERE DATE(e.entry_time) BETWEEN ? AND ?
       GROUP BY p.id, p.name
       ORDER BY visit_count DESC`,
      [startDate, endDate]
    );
  }

  /**
   * 오늘의 체험자 수 조회
   * @returns {Promise<number>} 체험자 수
   */
  static async countToday() {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM experience_logs WHERE DATE(entry_time) = CURDATE()'
    );
    return result[0].count;
  }

  /**
   * 현재 체험 중인 사용자 수 조회
   * @returns {Promise<number>} 체험 중인 사용자 수
   */
  static async countActive() {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM experience_logs WHERE exit_time IS NULL'
    );
    return result[0].count;
  }
}

module.exports = ExperienceLog;