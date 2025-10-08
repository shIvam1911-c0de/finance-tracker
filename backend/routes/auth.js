const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateAndSanitize, validateAuth } = require('../middleware/security');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [admin, user, read-only] }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Validation error }
 */
const limiterMiddlewareRegister = process.env.NODE_ENV === 'production' ? authLimiter : (req, res, next) => next();

router.post('/register', limiterMiddlewareRegister, validateAndSanitize, validateAuth, registerValidation, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
const limiterMiddleware = process.env.NODE_ENV === 'production' ? authLimiter : (req, res, next) => next();

router.post('/login', limiterMiddleware, validateAndSanitize, validateAuth, loginValidation, authController.login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Unauthorized }
 */
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;