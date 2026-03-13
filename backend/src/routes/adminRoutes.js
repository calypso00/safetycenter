const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * 관리자 라우트
 */

// 모든 라우트에 관리자 권한 필요
router.use(authenticate, requireAdmin);

// 대시보드 데이터
router.get('/dashboard', adminController.getDashboard);
router.get('/statistics/dashboard', adminController.getDashboard);

// 전체 통계
router.get('/stats', adminController.getStats);

// 일별 통계
router.get('/stats/daily', adminController.getDailyStats);
router.get('/statistics/daily', adminController.getDailyStats);

// 프로그램별 통계
router.get('/stats/programs', adminController.getProgramStats);
router.get('/statistics/programs', adminController.getProgramStats);

// 사용자 관리
router.get('/users', adminController.getUserList);
router.get('/users/:id', adminController.getUserDetail);
router.post('/users', adminController.createUser);
router.post('/users/bulk', adminController.createBulkUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// 예약 관리
router.get('/reservations', adminController.getReservationList);

// 체험 기록 관리
router.get('/experiences', adminController.getExperienceList);

module.exports = router;