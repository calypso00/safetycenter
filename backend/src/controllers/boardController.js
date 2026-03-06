const boardService = require('../services/boardService');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

/**
 * 게시판 컨트롤러
 */
class BoardController {
  /**
   * 게시글 목록 조회
   * GET /api/board/posts
   */
  async getPosts(req, res, next) {
    try {
      const { page, limit, category, status, search } = req.query;
      const result = await boardService.getPosts({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        category,
        status,
        search
      });
      
      return paginatedResponse(
        res,
        result.posts,
        result.page,
        result.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * 게시글 상세 조회
   * GET /api/board/posts/:id
   */
  async getPostById(req, res, next) {
    try {
      const post = await boardService.getPostById(req.params.id);
      return successResponse(res, post);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 게시글 작성
   * POST /api/board/posts
   */
  async createPost(req, res, next) {
    try {
      const post = await boardService.createPost(req.user.id, req.body);
      return createdResponse(res, post, '게시글이 등록되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 게시글 수정
   * PUT /api/board/posts/:id
   */
  async updatePost(req, res, next) {
    try {
      const post = await boardService.updatePost(req.params.id, req.user.id, req.body);
      return successResponse(res, post, '게시글이 수정되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 게시글 삭제
   * DELETE /api/board/posts/:id
   */
  async deletePost(req, res, next) {
    try {
      await boardService.deletePost(req.params.id, req.user.id);
      return successResponse(res, null, '게시글이 삭제되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 댓글 목록 조회
   * GET /api/board/posts/:id/comments
   */
  async getComments(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await boardService.getComments(req.params.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });
      
      return paginatedResponse(
        res,
        result.comments,
        result.page,
        result.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * 댓글 작성
   * POST /api/board/posts/:id/comments
   */
  async createComment(req, res, next) {
    try {
      const { content } = req.body;
      const comment = await boardService.createComment(req.params.id, req.user.id, content);
      return createdResponse(res, comment, '댓글이 등록되었습니다.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 댓글 삭제
   * DELETE /api/board/comments/:id
   */
  async deleteComment(req, res, next) {
    try {
      await boardService.deleteComment(req.params.id, req.user.id);
      return successResponse(res, null, '댓글이 삭제되었습니다.');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BoardController();