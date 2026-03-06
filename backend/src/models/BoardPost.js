const db = require('../config/database');

/**
 * 게시글 모델
 */
class BoardPost {
  /**
   * 게시글 생성
   * @param {Object} postData - 게시글 데이터
   * @returns {Promise<number>} 생성된 게시글 ID
   */
  static async create(postData) {
    const { user_id, title, content, category = 'inquiry' } = postData;
    
    const result = await db.query(
      `INSERT INTO board_posts (user_id, title, content, category, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [user_id, title, content, category]
    );
    
    return result.insertId;
  }

  /**
   * ID로 게시글 조회
   * @param {number} id - 게시글 ID
   * @returns {Promise<Object|null>} 게시글 정보
   */
  static async findById(id) {
    const posts = await db.query(
      `SELECT p.*, u.name as author_name, u.username
       FROM board_posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    return posts.length > 0 ? posts[0] : null;
  }

  /**
   * 게시글 목록 조회
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 게시글 목록과 전체 개수
   */
  static async findAll(options = {}) {
    const { page = 1, limit = 10, category = '', status = '', search = '' } = options;
    // page와 limit을 정수로 변환 (쿼리 파라미터는 문자열로 전달될 수 있음)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (category) {
      whereClause += ' AND p.category = ?';
      params.push(category);
    }

    if (status) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // 전체 개수 조회
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM board_posts p ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 목록 조회
    // LIMIT/OFFSET은 prepared statement에서 정수 타입으로 처리되므로 SQL에 직접 포함
    const posts = await db.query(
      `SELECT p.*, u.name as author_name
       FROM board_posts p
       JOIN users u ON p.user_id = u.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      params
    );

    return { posts, total };
  }

  /**
   * 게시글 수정
   * @param {number} id - 게시글 ID
   * @param {Object} updateData - 수정할 데이터
   * @returns {Promise<boolean>} 수정 성공 여부
   */
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    const allowedFields = ['title', 'content', 'category', 'status'];
    
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
      `UPDATE board_posts SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  /**
   * 게시글 삭제
   * @param {number} id - 게시글 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async delete(id) {
    // 먼저 댓글 삭제
    await db.query('DELETE FROM board_comments WHERE post_id = ?', [id]);
    
    // 게시글 삭제
    const result = await db.query('DELETE FROM board_posts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * 조회수 증가
   * @param {number} id - 게시글 ID
   */
  static async incrementViewCount(id) {
    await db.query(
      'UPDATE board_posts SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );
  }

  /**
   * 게시글 소유자 확인
   * @param {number} postId - 게시글 ID
   * @param {number} userId - 사용자 ID
   * @returns {Promise<boolean>} 소유자 여부
   */
  static async isOwner(postId, userId) {
    const result = await db.query(
      'SELECT id FROM board_posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    );
    return result.length > 0;
  }

  /**
   * 게시글 상태 변경
   * @param {number} id - 게시글 ID
   * @param {string} status - 새 상태
   * @returns {Promise<boolean>} 변경 성공 여부
   */
  static async updateStatus(id, status) {
    const result = await db.query(
      'UPDATE board_posts SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = BoardPost;