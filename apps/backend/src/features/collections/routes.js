const { Router } = require('express');
const { scan, seedBin } = require('./controller');

const router = Router();

/**
 * @swagger
 * /api/collections/scan:
 *   post:
 *     summary: Record a bin scan
 *     tags: [Collections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               binId:
 *                 type: string
 *               collectorId:
 *                 type: string
 *               weight:
 *                 type: number
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Scan recorded
 */
router.post('/scan', scan);

/**
 * @swagger
 * /api/collections/seed-bin/{id}:
 *   get:
 *     summary: Development helper to create or update a test bin
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bin seeded
 */
router.get('/seed-bin/:id?', seedBin);

module.exports = router;
