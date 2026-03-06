const db = require('../config/database');

/**
 * 사용자 모델
 */
class User {
  /**
   * 사용자 생성
   * @param {Object} userData - 사용자 데이터
   * @returns {Promise<number>} 생성된 사용자 ID
   */
  static async create(userData) {
    const { username, password_hash, name, phone, email, role = 'user' } = userData;
    
    const result = await db.query(
      `INSERT INTO users (username, password_hash, name, phone, email, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, password_hash, name, phone, email, role]
    );
    
    return result.insertId;
  }

  /**
   * ID로 사용자 조회
   * @param {number} id - 사용자 ID
   * @returns {Promise<Object|null>} 사용자 정보
   */
  static async findById(id) {
    const users = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return users.length > 0 ? users[0] : null;
  }

  /**
   * 사용자명으로 사용자 조회
   * @param {string} username - 사용자명
   * @returns {Promise<Object|null>} 사용자 정보
   */
  static async findByUsername(username) {
    const users = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return users.length > 0 ? users[0] : null;
  }

  /**
   * 이메일로 사용자 조회
   * @param {string} email - 이메일
   * @returns {Promise<Object|null>} 사용자 정보
   */
  static async findByEmail(email) {
    const users = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users.length > 0 ? users[0] : null;
  }

  /**
   * 사용자 정보 수정
   * @param {number} id - 사용자 ID
   * @param {Object} updateData - 수정할 데이터
   * @returns {Promise<boolean>} 수정 성공 여부
   */
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    const allowedFields = ['name', 'phone', 'email', 'password_hash'];
    
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
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  /**
   * 사용자 비활성화 (회원 탈퇴)
   * @param {number} id - 사용자 ID
   * @returns {Promise<boolean>} 비활성화 성공 여부
   */
  static async deactivate(id) {
    const result = await db.query(
      'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * 사용자 목록 조회 (관리자용)
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 사용자 목록과 전체 개수
   */
  static async findAll(options = {}) {
    const { page = 1, limit = 10, search = '', role = '', isActive = null } = options;
    // page와 limit을 정수로 변환 (쿼리 파라미터는 문자열로 전달될 수 있음)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR username LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (isActive !== null) {
      whereClause += ' AND is_active = ?';
      params.push(isActive);
    }

    // 전체 개수 조회
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 목록 조회
    // LIMIT/OFFSET은 prepared statement에서 정수 타입으로 처리되므로 SQL에 직접 포함
    const users = await db.query(
      `SELECT id, username, name, phone, email, role, is_active, created_at, updated_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      params
    );

    return { users, total };
  }

  /**
   * 사용자 수 조회
   * @returns {Promise<number>} 사용자 수
   */
  static async count() {
    const result = await db.query('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE');
    return result[0].count;
  }
}

module.exports = User;