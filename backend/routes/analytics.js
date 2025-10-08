const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');
const { ownershipCheck } = require('../middleware/roleCheck');
const { analyticsLimiter } = require('../middleware/rateLimiter');

// Apply middleware - analytics accessible to all roles (admin, user, read-only)
router.use(authMiddleware);
router.use(analyticsLimiter);
router.use(ownershipCheck); // Ensure users see only their own analytics

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     tags: [Analytics]
 *     summary: Get user analytics (all roles)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [monthly, yearly] }
 *     responses:
 *       200: { description: User analytics data }
 */
router.get('/', analyticsController.getAnalytics);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get dashboard statistics (all roles)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Dashboard statistics }
 */
router.get('/dashboard', analyticsController.getDashboardStats);

module.exports = router;