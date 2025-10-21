const { Router } = require('express');
const { getMyAccount, schedulePickup } = require('./controller');
const { requireRole } = require('../auth/service');
const asyncHandler = require('../../utils/asyncHandler');

const router = Router();

/**
 * @swagger
 * /api/accounts/me:
 *   get:
 *     summary: Get current user's account details
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: Account info
 *       401:
 *         description: Unauthorized
 */
router.get('/me', requireRole(['resident','user','admin']), asyncHandler(getMyAccount));
/**
 * @swagger
 * /api/accounts/pickups:
 *   post:
 *     summary: Schedule a pickup for the current user
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Pickup scheduled
 *       401:
 *         description: Unauthorized
 */
router.post('/pickups', requireRole(['resident','user','admin']), asyncHandler(schedulePickup));

module.exports = router;
