const BoardPost = require('../models/BoardPost');
const BoardComment = require('../models/BoardComment');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');

/**
 * 게시판 서비스
 */
class BoardService {
  /**
   * 게시글 목록 조회
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 게시글 목록
   */
  async getPosts(options = {}) {
    const { page = 1, limit = 10, category = '', status = '', search = '' } = options;
    
    const { posts, total } = await BoardPost.findAll({ page, limit, category, status, search });
    
    return {
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        author_name: post.author_name,
        category: post.category,
        status: post.status,
        view_count: post.view_count,
        created_at: post.created_at,
        updated_at: post.updated_at
      })),
      total,
      page,
      limit
    };
  }

  /**
   * 게시글 상세 조회
   * @param {number} postId - 게시글 ID
   * @returns {Promise<Object>} 게시글 상세
   */
  async getPostById(postId) {
    const post = await BoardPost.findById(postId);
    if (!post) {
      throw new NotFoundError('게시글을 찾을 수 없습니다.');
    }

    // 조회수 증가
    await BoardPost.incrementViewCount(postId);

    // 댓글 목록 조회
    const { comments } = await this.getComments(postId);

    return {
      id: post.id,
      user_id: post.user_id,
      author_name: post.author_name,
      username: post.username,
      title: post.title,
      content: post.content,
      category: post.category,
      status: post.status,
      view_count: post.view_count + 1,
      created_at: post.created_at,
      updated_at: post.updated_at,
      comments: comments // 댓글 목록 추가
    };
  }

  /**
   * 게시글 작성
   * @param {number} userId - 사용자 ID
   * @param {Object} postData - 게시글 데이터
   * @returns {Promise<Object>} 생성된 게시글
   */
  async createPost(userId, postData) {
    const { title, content, category = 'inquiry' } = postData;

    if (!title || !content) {
      throw new BadRequestError('제목과 내용을 모두 입력해주세요.');
    }

    const postId = await BoardPost.create({
      user_id: userId,
      title,
      content,
      category
    });

    return this.getPostById(postId);
  }

  /**
   * 게시글 수정
   * @param {number} postId - 게시글 ID
   * @param {number} userId - 사용자 ID
   * @param {Object} updateData - 수정할 데이터
   * @returns {Promise<Object>} 수정된 게시글
   */
  async updatePost(postId, userId, updateData) {
    const post = await BoardPost.findById(postId);
    if (!post) {
      throw new NotFoundError('게시글을 찾을 수 없습니다.');
    }

    // 소유자 확인
    if (post.user_id !== userId) {
      throw new ForbiddenError('수정 권한이 없습니다.');
    }

    await BoardPost.update(postId, updateData);

    return this.getPostById(postId);
  }

  /**
   * 게시글 삭제
   * @param {number} postId - 게시글 ID
   * @param {number} userId - 사용자 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deletePost(postId, userId) {
    const post = await BoardPost.findById(postId);
    if (!post) {
      throw new NotFoundError('게시글을 찾을 수 없습니다.');
    }

    // 소유자 확인
    if (post.user_id !== userId) {
      throw new ForbiddenError('삭제 권한이 없습니다.');
    }

    return BoardPost.delete(postId);
  }

  /**
   * 댓글 목록 조회
   * @param {number} postId - 게시글 ID
   * @param {Object} options - 조회 옵션
   * @returns {Promise<Object>} 댓글 목록
   */
  async getComments(postId, options = {}) {
    const { page = 1, limit = 20 } = options;
    
    const { comments, total } = await BoardComment.findByPostId(postId, { page, limit });
    
    return {
      comments: comments.map(comment => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        author_name: comment.author_name,
        content: comment.content,
        created_at: comment.created_at
      })),
      total,
      page,
      limit
    };
  }

  /**
   * 댓글 작성
   * @param {number} postId - 게시글 ID
   * @param {number} userId - 사용자 ID
   * @param {string} content - 댓글 내용
   * @returns {Promise<Object>} 생성된 댓글
   */
  async createComment(postId, userId, content) {
    // 게시글 존재 확인
    const post = await BoardPost.findById(postId);
    if (!post) {
      throw new NotFoundError('게시글을 찾을 수 없습니다.');
    }

    if (!content || content.trim() === '') {
      throw new BadRequestError('댓글 내용을 입력해주세요.');
    }

    const commentId = await BoardComment.create({
      post_id: postId,
      user_id: userId,
      content
    });

    // 게시글 상태를 'answered'로 변경 (관리자 댓글인 경우)
    const comment = await BoardComment.findById(commentId);
    
    return {
      id: comment.id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      author_name: comment.author_name,
      content: comment.content,
      created_at: comment.created_at
    };
  }

  /**
   * 댓글 삭제
   * @param {number} commentId - 댓글 ID
   * @param {number} userId - 사용자 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteComment(commentId, userId) {
    const comment = await BoardComment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('댓글을 찾을 수 없습니다.');
    }

    // 소유자 확인
    if (comment.user_id !== userId) {
      throw new ForbiddenError('삭제 권한이 없습니다.');
    }

    return BoardComment.delete(commentId);
  }

  /**
   * 게시글 상태 변경 (관리자용)
   * @param {number} postId - 게시글 ID
   * @param {string} status - 새 상태
   * @returns {Promise<Object>} 수정된 게시글
   */
  async updatePostStatus(postId, status) {
    const post = await BoardPost.findById(postId);
    if (!post) {
      throw new NotFoundError('게시글을 찾을 수 없습니다.');
    }

    await BoardPost.updateStatus(postId, status);

    return this.getPostById(postId);
  }
}

module.exports = new BoardService();