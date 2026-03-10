const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const faceController = require('../controllers/faceController');
const { authenticate, requireAdmin, requireOwnerOrAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Face
 *   description: Face recognition API endpoints
 */

/**
 * @swagger
 * /api/face/register:
 *   post:
 *     summary: Register face data
 *     tags: [Face]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               image:
 *                 type: string
 *                 description: Base64 encoded image
 *               face_encoding:
 *                 type: string
 *                 description: Pre-computed face encoding (JSON string)
 *     responses:
 *       201:
 *         description: Face registered successfully
 */

// POST /api/face/register - Register face data
router.post('/register',
  authenticate,
  [
    body('user_id').optional().isInt({ min: 1 }).withMessage('Invalid user ID'),
    body('image').optional().isString().withMessage('Image must be a string'),
    body('face_encoding').optional().isString().withMessage('Face encoding must be a string')
  ],
  faceController.registerFace
);

/**
 * @swagger
 * /api/face/verify:
 *   post:
 *     summary: Verify face against registered faces
 *     tags: [Face]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 encoded image
 *               face_encoding:
 *                 type: string
 *                 description: Pre-computed face encoding (JSON string)
 *     responses:
 *       200:
 *         description: Face verification result
 */

// POST /api/face/verify - Verify face (public for kiosk)
router.post('/verify',
  [
    body('image').optional().isString().withMessage('Image must be a string'),
    body('face_encoding').optional().isString().withMessage('Face encoding must be a string')
  ],
  faceController.verifyFace
);

/**
 * @swagger
 * /api/face/detect:
 *   post:
 *     summary: Detect faces in image
 *     tags: [Face]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 encoded image
 *     responses:
 *       200:
 *         description: Face detection result
 */

// POST /api/face/detect - Detect faces in image (public for kiosk)
router.post('/detect',
  [
    body('image').notEmpty().withMessage('Image is required')
  ],
  faceController.detectFaces
);

/**
 * @swagger
 * /api/face/status/{userId}:
 *   get:
 *     summary: Get face registration status
 *     tags: [Face]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: Face registration status
 */

// GET /api/face/status/:userId - Get face registration status
router.get('/status/:userId?', authenticate, faceController.getFaceStatus);

/**
 * @swagger
 * /api/face/{userId}:
 *   delete:
 *     summary: Delete face data
 *     tags: [Face]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: Face data deleted successfully
 */

// DELETE /api/face/:userId - Delete face data
router.delete('/:userId?', authenticate, faceController.deleteFace);

/**
 * @swagger
 * /api/face/module-status:
 *   get:
 *     summary: Get face recognition module status
 *     tags: [Face]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Module status
 */

// GET /api/face/module-status - Get module status (public for kiosk)
router.get('/module-status', faceController.getModuleStatus);

module.exports = router;