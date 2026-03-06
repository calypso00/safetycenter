const db = require('../config/database');

/**
 * 체험 프로그램 모델
 */
class Program {
  /**
   * 프로그램 생성
   * @param {Object} programData - 프로그램 데이터
   * @returns {Promise<number>} 생성된 프로그램 ID
   */
  static async create(programData) {
    const { name, description, duration_minutes = 60, capacity = 20, location } = programData;
    
    const result = await db.query(
      `INSERT INTO programs (name, description, duration_minutes, capacity, location)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, duration_minutes, capacity, location]
    );
    
    return result.insertId;
  }

  /**
   * ID로 프로그램 조회
   * @param {number} id - 프로그램 ID
   * @returns {Promise<Object|null>} 프로그램 정보
   */
  static async findById(id) {
    const programs = await db.query(
      'SELECT * FROM programs WHERE id = ?',
      [id]
    );
    return programs.length > 0 ? programs[0] : null;
  }

  /**
   * 프로그램 목록 조회
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 프로그램 목록과 전체 개수
   */
  static async findAll(options = {}) {
    const { page = 1, limit = 10, isActive = true } = options;
    // page와 limit을 정수로 변환 (쿼리 파라미터는 문자열로 전달될 수 있음)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    const whereClause = isActive !== null ? "WHERE status = ?" : '';
    const params = isActive !== null ? ['active'] : [];

    // 전체 개수 조회
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM programs ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 목록 조회
    // LIMIT/OFFSET은 prepared statement에서 정수 타입으로 처리되므로 SQL에 직접 포함
    const programs = await db.query(
      `SELECT * FROM programs ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      params
    );

    return { programs, total };
  }

  /**
   * 활성화된 프로그램 전체 조회 (페이지네이션 없음)
   * @returns {Promise<Array>} 프로그램 목록
   */
  static async findAllActive() {
    return await db.query(
      "SELECT * FROM programs WHERE status = 'active' ORDER BY created_at DESC"
    );
  }

  /**
   * 프로그램 수정
   * @param {number} id - 프로그램 ID
   * @param {Object} updateData - 수정할 데이터
   * @returns {Promise<boolean>} 수정 성공 여부
   */
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    const allowedFields = ['name', 'description', 'duration_minutes', 'capacity', 'location', 'status'];
    
    // is_active가 전달되면 status로 변환
    if (updateData.is_active !== undefined && updateData.status === undefined) {
      updateData.status = updateData.is_active ? 'active' : 'inactive';
    }
    
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
      `UPDATE programs SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  /**
   * 프로그램 비활성화
   * @param {number} id - 프로그램 ID
   * @returns {Promise<boolean>} 비활성화 성공 여부
   */
  static async deactivate(id) {
    const result = await db.query(
      "UPDATE programs SET status = 'inactive' WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * 프로그램 삭제
   * @param {number} id - 프로그램 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM programs WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * 특정 날짜/시간의 예약 가능 인원 조회
   * @param {number} programId - 프로그램 ID
   * @param {string} date - 날짜 (YYYY-MM-DD)
   * @param {string} time - 시간 (HH:MM)
   * @returns {Promise<number>} 예약된 인원 수
   */
  static async getReservedCount(programId, date, time) {
    const result = await db.query(
      `SELECT COALESCE(SUM(participant_count), 0) as reserved_count
       FROM reservations
       WHERE program_id = ?
         AND reservation_date = ?
         AND time_slot = ?
         AND status IN ('pending', 'confirmed')`,
      [programId, date, time]
    );
    return result[0].reserved_count;
  }
}

module.exports = Program;