const db = require('../config/database');

/**
 * 안면 데이터 모델
 */
class FaceData {
  /**
   * 안면 데이터 등록
   * @param {Object} faceData - 안면 데이터
   * @returns {Promise<number>} 생성된 ID
   */
  static async create(faceData) {
    const { user_id, face_encoding, image_path = null } = faceData;
    
    const result = await db.query(
      `INSERT INTO face_data (user_id, face_encoding, image_path)
       VALUES (?, ?, ?)`,
      [user_id, face_encoding, image_path]
    );
    
    return result.insertId;
  }

  /**
   * 사용자 ID로 안면 데이터 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object|null>} 안면 데이터
   */
  static async findByUserId(userId) {
    const faceData = await db.query(
      'SELECT * FROM face_data WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );
    return faceData.length > 0 ? faceData[0] : null;
  }

  /**
   * ID로 안면 데이터 조회
   * @param {number} id - 안면 데이터 ID
   * @returns {Promise<Object|null>} 안면 데이터
   */
  static async findById(id) {
    const faceData = await db.query(
      'SELECT * FROM face_data WHERE id = ?',
      [id]
    );
    return faceData.length > 0 ? faceData[0] : null;
  }

  /**
   * 모든 활성 안면 데이터 조회 (안면인식용)
   * @returns {Promise<Array>} 안면 데이터 목록
   */
  static async findAllActive() {
    return await db.query(
      `SELECT f.*, u.name as user_name, u.username
       FROM face_data f
       JOIN users u ON f.user_id = u.id
       WHERE f.is_active = TRUE AND u.is_active = TRUE`
    );
  }

  /**
   * 안면 데이터 비활성화
   * @param {number} userId - 사용자 ID
   * @returns {Promise<boolean>} 비활성화 성공 여부
   */
  static async deactivateByUserId(userId) {
    const result = await db.query(
      'UPDATE face_data SET is_active = FALSE WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * 안면 데이터 삭제
   * @param {number} id - 안면 데이터 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async delete(id) {
    const result = await db.query('DELETE FROM face_data WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * 사용자의 안면 데이터 존재 여부 확인
   * @param {number} userId - 사용자 ID
   * @returns {Promise<boolean>} 존재 여부
   */
  static async existsByUserId(userId) {
    const result = await db.query(
      'SELECT id FROM face_data WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );
    return result.length > 0;
  }

  /**
   * 안면 데이터 업데이트
   * @param {number} userId - 사용자 ID
   * @param {Object} updateData - 업데이트 데이터
   * @returns {Promise<boolean>} 업데이트 성공 여부
   */
  static async updateByUserId(userId, updateData) {
    const fields = [];
    const values = [];

    const allowedFields = ['face_encoding', 'image_path'];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(userId);
    
    const result = await db.query(
      `UPDATE face_data SET ${fields.join(', ')} WHERE user_id = ? AND is_active = TRUE`,
      values
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = FaceData;