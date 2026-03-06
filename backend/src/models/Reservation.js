const db = require('../config/database');

/**
 * 예약 모델
 */
class Reservation {
  /**
   * 예약 생성
   * @param {Object} reservationData - 예약 데이터
   * @returns {Promise<number>} 생성된 예약 ID
   */
  static async create(reservationData) {
    const { user_id, program_id, reservation_date, time_slot, participant_count = 1 } = reservationData;

    const result = await db.query(
      `INSERT INTO reservations (user_id, program_id, reservation_date, time_slot, participant_count, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [user_id, program_id, reservation_date, time_slot, participant_count]
    );
    
    return result.insertId;
  }

  /**
   * ID로 예약 조회
   * @param {number} id - 예약 ID
   * @returns {Promise<Object|null>} 예약 정보
   */
  static async findById(id) {
    const reservations = await db.query(
      `SELECT r.*, p.name as program_name, p.location, p.duration_minutes,
              u.name as user_name, u.username, u.email, u.phone
       FROM reservations r
       JOIN programs p ON r.program_id = p.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );
    return reservations.length > 0 ? reservations[0] : null;
  }

  /**
   * 사용자의 예약 목록 조회
   * @param {number} userId - 사용자 ID
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 예약 목록과 전체 개수
   */
  static async findByUserId(userId, options = {}) {
    const { page = 1, limit = 10, status = '' } = options;
    // page와 limit을 정수로 변환 (쿼리 파라미터는 문자열로 전달될 수 있음)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    let whereClause = 'WHERE r.user_id = ?';
    const params = [userId];

    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    // 전체 개수 조회
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM reservations r ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 목록 조회
    // LIMIT/OFFSET은 prepared statement의 파라미터로 전달
    const reservations = await db.query(
      `SELECT r.*, p.name as program_name, p.location, p.duration_minutes
       FROM reservations r
       JOIN programs p ON r.program_id = p.id
       ${whereClause}
        ORDER BY r.reservation_date DESC, r.time_slot DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return { reservations, total };
  }

  /**
   * 전체 예약 목록 조회 (관리자용)
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 예약 목록과 전체 개수
   */
  static async findAll(options = {}) {
    const { page = 1, limit = 10, status = '', date = '', programId = '' } = options;
    // page와 limit을 정수로 변환 (쿼리 파라미터는 문자열로 전달될 수 있음)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    if (date) {
      whereClause += ' AND r.reservation_date = ?';
      params.push(date);
    }

    if (programId) {
      whereClause += ' AND r.program_id = ?';
      params.push(programId);
    }

    // 전체 개수 조회
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM reservations r ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 목록 조회
    // LIMIT/OFFSET은 prepared statement에서 정수 타입으로 처리되므로 SQL에 직접 포함
    const reservations = await db.query(
      `SELECT r.*, p.name as program_name, p.location,
              u.name as user_name, u.username, u.email, u.phone
       FROM reservations r
       JOIN programs p ON r.program_id = p.id
       JOIN users u ON r.user_id = u.id
       ${whereClause}
        ORDER BY r.reservation_date DESC, r.time_slot DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      params
    );

    return { reservations, total };
  }

  /**
   * 예약 수정
   * @param {number} id - 예약 ID
   * @param {Object} updateData - 수정할 데이터
   * @returns {Promise<boolean>} 수정 성공 여부
   */
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    const allowedFields = ['reservation_date', 'time_slot', 'participant_count', 'status'];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    
    const result = await db.query(
      `UPDATE reservations SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  /**
   * 예약 취소
   * @param {number} id - 예약 ID
   * @returns {Promise<boolean>} 취소 성공 여부
   */
  static async cancel(id) {
    const result = await db.query(
      "UPDATE reservations SET status = 'cancelled', updated_at = NOW() WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * 예약 상태 변경
   * @param {number} id - 예약 ID
   * @param {string} status - 새 상태
   * @returns {Promise<boolean>} 변경 성공 여부
   */
  static async updateStatus(id, status) {
    const result = await db.query(
      'UPDATE reservations SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * 예약 소유자 확인
   * @param {number} reservationId - 예약 ID
   * @param {number} userId - 사용자 ID
   * @returns {Promise<boolean>} 소유자 여부
   */
  static async isOwner(reservationId, userId) {
    const result = await db.query(
      'SELECT id FROM reservations WHERE id = ? AND user_id = ?',
      [reservationId, userId]
    );
    return result.length > 0;
  }

  /**
   * 특정 날짜의 예약 목록 조회
   * @param {string} date - 날짜 (YYYY-MM-DD)
   * @returns {Promise<Array>} 예약 목록
   */
  static async findByDate(date) {
    return await db.query(
      `SELECT r.*, p.name as program_name, u.name as user_name
       FROM reservations r
       JOIN programs p ON r.program_id = p.id
       JOIN users u ON r.user_id = u.id
        WHERE r.reservation_date = ?
        ORDER BY r.time_slot ASC`,
      [date]
    );
  }

  /**
   * 예약 통계 조회
   * @param {string} startDate - 시작 날짜
   * @param {string} endDate - 종료 날짜
   * @returns {Promise<Object>} 통계 데이터
   */
  static async getStats(startDate, endDate) {
    const result = await db.query(
      `SELECT 
         COUNT(*) as total_count,
         SUM(participant_count) as total_participants,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
         SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_count,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
       FROM reservations
        WHERE reservation_date BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    return result[0];
  }
}

module.exports = Reservation;