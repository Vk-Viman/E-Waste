const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { login, seedAdmin, register, session, logout, forgotPassword, resetPassword } = require('./controller');
const asyncHandler = require('../../utils/asyncHandler');
const { protect } = require('./service');

const router = Router();

// Rate limiters for sensitive endpoints
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
const forgotLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and return a session cookie
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login, cookie set
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginLimiter, asyncHandler(login));
router.post('/register', registerLimiter, asyncHandler(register));
router.post('/seed-admin', asyncHandler(seedAdmin));
// Convenience GET endpoint to seed admin from the browser
router.get('/seed-admin', asyncHandler(seedAdmin));
router.get('/session', protect, asyncHandler(session));
router.post('/logout', protect, asyncHandler(logout));

// Password reset
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Create a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 */
/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Return the current authenticated user's session info
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Session info
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout by clearing the session cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Initiate password reset by email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent if account exists
 */
router.post('/forgot-password', forgotLimiter, asyncHandler(forgotPassword));
/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using a valid token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password/:token', asyncHandler(resetPassword));

module.exports = router;
