const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const programController = require('../controllers/programController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

/**
 * 프로그램 라우트
 */

// 프로그램 목록 조회 (공개)
router.get('/', optionalAuth, programController.getPrograms);

// 프로그램 상세 조회 (공개)
router.get('/:id', optionalAuth, programController.getProgramById);

// 예약 가능 시간 조회 (공개)
router.get('/:id/slots', programController.getAvailableSlots);

// 관리자 전용 라우트
// 프로그램 생성
router.post('/',
  authenticate,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('프로그램명은 필수입니다.'),
    body('duration_minutes').optional().isInt({ min: 1 }).withMessage('소요 시간은 1 이상이어야 합니다.'),
    body('capacity').optional().isInt({ min: 1 }).withMessage('수용 인원은 1 이상이어야 합니다.')
  ],
  programController.createProgram
);

// 프로그램 수정
router.put('/:id',
  authenticate,
  requireAdmin,
  programController.updateProgram
);

// 프로그램 삭제
router.delete('/:id',
  authenticate,
  requireAdmin,
  programController.deleteProgram
);

module.exports = router;