const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * 인증 라우트
 */

// 회원가입
router.post('/register',
  [
    body('username')
      .isLength({ min: 4, max: 50 })
      .withMessage('아이디는 4-50자여야 합니다.')
      .isAlphanumeric()
      .withMessage('아이디는 영문과 숫자만 사용 가능합니다.'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('비밀번호는 최소 6자 이상이어야 합니다.'),
    body('name')
      .notEmpty()
      .withMessage('이름은 필수입니다.'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('유효한 이메일 형식이 아닙니다.'),
    body('phone')
      .optional()
      .matches(/^[0-9-]+$/)
      .withMessage('유효한 전화번호 형식이 아닙니다.')
  ],
  authController.register
);

// 로그인
router.post('/login',
  [
    body('username').notEmpty().withMessage('아이디를 입력해주세요.'),
    body('password').notEmpty().withMessage('비밀번호를 입력해주세요.')
  ],
  authController.login
);

// 로그아웃 (인증 필요)
router.post('/logout', authenticate, authController.logout);

// 현재 사용자 정보 (인증 필요)
router.get('/me', authenticate, authController.getCurrentUser);

// 토큰 갱신 (인증 필요)
router.post('/refresh', authenticate, authController.refreshToken);

module.exports = router;