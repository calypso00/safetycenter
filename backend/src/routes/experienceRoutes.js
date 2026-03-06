const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const experienceController = require('../controllers/experienceController');
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * 체험 라우트
 */

// 내 체험 기록 목록 (인증 필요)
router.get('/my-logs', authenticate, experienceController.getMyLogs);

// 체험 통계 조회 (인증 필요)
router.get('/stats', authenticate, experienceController.getStats);

// 일별 통계 조회 (관리자용)
router.get('/stats/daily', authenticate, requireAdmin, experienceController.getDailyStats);

// 프로그램별 통계 조회 (관리자용)
router.get('/stats/programs', authenticate, requireAdmin, experienceController.getProgramStats);

// 오늘의 체험 현황 (관리자용)
router.get('/today', authenticate, requireAdmin, experienceController.getTodayStatus);

// 입장 처리 (인증 필요 - 키오스크에서 사용)
router.post('/check-in',
  authenticate,
  [
    body('user_id').isInt({ min: 1 }).withMessage('사용자 ID가 필요합니다.'),
    body('program_id').isInt({ min: 1 }).withMessage('프로그램 ID가 필요합니다.'),
    body('reservation_id').optional().isInt({ min: 1 }),
    body('entry_method').optional().isIn(['face', 'manual']).withMessage('입장 방식은 face 또는 manual이어야 합니다.')
  ],
  experienceController.checkIn
);

// 퇴장 처리 (인증 필요 - 키오스크에서 사용)
router.post('/check-out',
  authenticate,
  [
    body('log_id').isInt({ min: 1 }).withMessage('체험 기록 ID가 필요합니다.')
  ],
  experienceController.checkOut
);

module.exports = router;