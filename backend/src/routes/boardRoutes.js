const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const boardController = require('../controllers/boardController');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * 게시판 라우트
 */

// 게시글 목록 조회 (공개)
router.get('/posts', optionalAuth, boardController.getPosts);

// 게시글 상세 조회 (공개)
router.get('/posts/:id', optionalAuth, boardController.getPostById);

// 게시글 작성 (인증 필요)
router.post('/posts',
  authenticate,
  [
    body('title').notEmpty().withMessage('제목은 필수입니다.'),
    body('content').notEmpty().withMessage('내용은 필수입니다.'),
    body('category').optional().isIn(['inquiry', 'notice', 'faq']).withMessage('유효하지 않은 카테고리입니다.')
  ],
  boardController.createPost
);

// 게시글 수정 (인증 필요)
router.put('/posts/:id', authenticate, boardController.updatePost);

// 게시글 삭제 (인증 필요)
router.delete('/posts/:id', authenticate, boardController.deletePost);

// 댓글 목록 조회 (공개)
router.get('/posts/:id/comments', optionalAuth, boardController.getComments);

// 댓글 작성 (인증 필요)
router.post('/posts/:id/comments',
  authenticate,
  [
    body('content').notEmpty().withMessage('댓글 내용은 필수입니다.')
  ],
  boardController.createComment
);

// 댓글 삭제 (인증 필요)
router.delete('/comments/:id', authenticate, boardController.deleteComment);

module.exports = router;