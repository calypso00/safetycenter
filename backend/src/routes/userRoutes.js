const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const reservationController = require('../controllers/reservationController');
const experienceController = require('../controllers/experienceController');
const { authenticate } = require('../middleware/auth');

/**
 * 사용자 라우트
 */

// 모든 라우트에 인증 필요
router.use(authenticate);

// 내 예약 목록 조회
router.get('/reservations', reservationController.getMyReservations);

// 내 체험 기록 목록 조회
router.get('/experiences', experienceController.getMyLogs);

// 프로필 조회
router.get('/profile', userController.getProfile);

// 프로필 수정
router.put('/profile',
  [
    body('name').optional().notEmpty().withMessage('이름은 비워둘 수 없습니다.'),
    body('email').optional().isEmail().withMessage('유효한 이메일 형식이 아닙니다.'),
    body('phone').optional().matches(/^[0-9-]+$/).withMessage('유효한 전화번호 형식이 아닙니다.'),
    body('current_password')
      .optional()
      .notEmpty()
      .withMessage('현재 비밀번호를 입력해주세요.'),
    body('new_password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('새 비밀번호는 최소 6자 이상이어야 합니다.')
  ],
  userController.updateProfile
);

// 회원 탈퇴
router.delete('/account',
  [
    body('password').notEmpty().withMessage('비밀번호를 입력해주세요.')
  ],
  userController.deleteAccount
);

module.exports = router;