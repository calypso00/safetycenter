const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reservationController = require('../controllers/reservationController');
const { authenticate } = require('../middleware/auth');

/**
 * reservationRoutes
 */

// reservationRoutes
router.use(authenticate);

// reservationRoutes
router.get('/', reservationController.getMyReservations);

// reservationRoutes
router.get('/:id', reservationController.getReservationById);

// reservationRoutes
router.post('/',
  [
    body('program_id').isInt({ min: 1 }).withMessage('program_id is required.'),
    body('reserved_date').isDate().withMessage('reserved_date is required.'),
    body('reserved_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('reserved_time is required.'),
    body('participant_count').optional().isInt({ min: 1 }).withMessage('participant_count must be at least 1.')
  ],
  reservationController.createReservation
);

// reservationRoutes
router.put('/:id', reservationController.updateReservation);

// reservationRoutes
router.delete('/:id', reservationController.cancelReservation);

module.exports = router;