const db = require('../config/database');

/**
 * 게시글 댓글 모델
 */
class BoardComment {
  /**
   * 댓글 생성
   * @param {Object} commentData - 댓글 데이터
   * @returns {Promise<number>} 생성된 댓글 ID
   */
  static async create(commentData) {
    const { post_id, user_id, content } = commentData;
    
    const result = await db.query(
      `INSERT INTO board_comments (post_id, user_id, content)
       VALUES (?, ?, ?)`,
      [post_id, user_id, content]
    );
    
    return result.insertId;
  }

  /**
   * ID로 댓글 조회
   * @param {number} id - 댓글 ID
   * @returns {Promise<Object|null>} 댓글 정보
   */
  static async findById(id) {
    const comments = await db.query(
      `SELECT c.*, u.name as author_name, u.username
       FROM board_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    return comments.length > 0 ? comments[0] : null;
  }

  /**
   * 게시글의 댓글 목록 조회
   * @param {number} postId - 게시글 ID
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 댓글 목록과 전체 개수
   */
  static async findByPostId(postId, options = {}) {
    const { page = 1, limit = 20 } = options;
    // page와 limit을 정수로 변환 (쿼리 파라미터는 문자열로 전달될 수 있음)
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    // 전체 개수 조회
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM board_comments WHERE post_id = ?',
      [postId]
    );
    const total = countResult[0].total;

    // 목록 조회
    // LIMIT/OFFSET은 prepared statement에서 정수 타입으로 처리되므로 SQL에 직접 포함
    const comments = await db.query(
      `SELECT c.*, u.name as author_name
       FROM board_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC
       LIMIT ${limitNum} OFFSET ${offset}`,
      [postId]
    );

    return { comments, total };
  }

  /**
   * 댓글 삭제
   * @param {number} id - 댓글 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async delete(id) {
    const result = await db.query('DELETE FROM board_comments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * 댓글 소유자 확인
   * @param {number} commentId - 댓글 ID
   * @param {number} userId - 사용자 ID
   * @returns {Promise<boolean>} 소유자 여부
   */
  static async isOwner(commentId, userId) {
    const result = await db.query(
      'SELECT id FROM board_comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );
    return result.length > 0;
  }

  /**
   * 게시글의 모든 댓글 삭제
   * @param {number} postId - 게시글 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async deleteByPostId(postId) {
    const result = await db.query('DELETE FROM board_comments WHERE post_id = ?', [postId]);
    return result.affectedRows > 0;
  }
}

module.exports = BoardComment;