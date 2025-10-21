const { Router } = require('express');
const { listRoutes, createRoute, optimizeRoutes } = require('./controller');
const { requireRole } = require('../auth/service');

const router = Router();

/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: List collection routes
 *     tags: [Routes]
 *     responses:
 *       200:
 *         description: List of routes
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', requireRole(['manager','admin']), listRoutes);
/**
 * @swagger
 * /api/routes:
 *   post:
 *     summary: Create a new collection route
 *     tags: [Routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Route created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', requireRole(['manager','admin']), createRoute);
/**
 * @swagger
 * /api/routes/optimize:
 *   post:
 *     summary: Optimize collection routes
 *     tags: [Routes]
 *     responses:
 *       200:
 *         description: Optimization result
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/optimize', requireRole(['manager','admin']), optimizeRoutes);

module.exports = router;
