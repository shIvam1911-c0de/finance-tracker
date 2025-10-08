const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { validateAndSanitize } = require('../middleware/security');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(validateAndSanitize);
router.use(roleCheck('admin')); // Only admins can access these routes

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     tags: [Admin]
 *     summary: Get all transactions (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: All transactions with user info }
 *       403: { description: Admin access required }
 */
router.get('/transactions', adminController.getAllTransactions);

/**
 * @swagger
 * /api/admin/transactions/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete any transaction (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Transaction deleted }
 *       403: { description: Admin access required }
 */
router.delete('/transactions/:id', adminController.deleteAnyTransaction);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get system statistics (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: System statistics }
 *       403: { description: Admin access required }
 */
router.get('/stats', adminController.getUserStats);

module.exports = router;