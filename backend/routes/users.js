const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { validateAndSanitize } = require('../middleware/security');

router.use(authMiddleware);
router.use(validateAndSanitize);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of all users }
 *       403: { description: Admin access required }
 */
router.get('/', roleCheck('admin'), userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     tags: [Users]
 *     summary: Update user role (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [admin, user, read-only] }
 *     responses:
 *       200: { description: Role updated successfully }
 *       403: { description: Admin access required }
 */
router.put('/:id/role', roleCheck('admin'), userController.updateUserRole);

router.delete('/:id', roleCheck('admin'), userController.deleteUser);

module.exports = router;