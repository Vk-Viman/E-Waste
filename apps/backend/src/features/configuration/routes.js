/**
 * SOLID PRINCIPLES APPLIED IN THIS FILE:
 * 
 * I - Interface Segregation Principle:
 *     Routes are separated by functionality (config routes vs category routes)
 *     Each route has focused purpose, not forcing clients to depend on unused endpoints
 * 
 * D - Dependency Inversion Principle:
 *     Routes depend on controller abstractions (functions), not concrete implementations
 *     Middleware (protect, adminOnly) are injected dependencies
 */

const { Router } = require('express');
const { 
  getConfig, 
  updateConfig, 
  deleteConfig,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require('./controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = Router();

// SOLID: I (Interface Segregation) - System config routes separated from category routes
// SOLID: D (Dependency Inversion) - Depends on middleware abstractions (protect, adminOnly)
// System Configuration Routes
router.get('/', protect, adminOnly, asyncHandler(getConfig));
/**
 * @swagger
 * components:
 *   schemas:
 *     BillingModel:
 *       type: object
 *       required: [name, rate]
 *       properties:
 *         name:
 *           type: string
 *           example: Weight-Based
 *         rate:
 *           type: number
 *           minimum: 0
 *           example: 0.5
 *     WasteCategory:
 *       type: object
 *       required: [key, label]
 *       properties:
 *         key:
 *           type: string
 *           example: plastic
 *         label:
 *           type: string
 *           example: Plastic Waste
 *     CollectionRules:
 *       type: object
 *       properties:
 *         frequency:
 *           type: string
 *           enum: [daily, weekly, biweekly, monthly]
 *           example: weekly
 *         timeSlot:
 *           type: string
 *           example: "08:00-12:00"
 *         maxBinsPerCollection:
 *           type: number
 *           minimum: 1
 *           example: 2
 *     SystemConfig:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         activeBillingModel:
 *           type: string
 *           description: Name of the currently active billing model (must match a name in billingModels array)
 *           example: Flat Fee
 *         billingModels:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BillingModel'
 *         wasteCategories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WasteCategory'
 *         collectionRules:
 *           $ref: '#/components/schemas/CollectionRules'
 *       example:
 *         _id: 665f1e9a2c0fe7e8f1234567
 *         activeBillingModel: "Flat Fee"
 *         billingModels:
 *           - { name: "Flat Fee", rate: 10 }
 *           - { name: "Weight-Based", rate: 0.5 }
 *         wasteCategories:
 *           - { key: "plastic", label: "Plastic" }
 *           - { key: "paper", label: "Paper" }
 *         collectionRules:
 *           frequency: "weekly"
 *           timeSlot: "08:00-12:00"
 *           maxBinsPerCollection: 2
 */
/**
 * @swagger
 * /api/configuration:
 *   get:
 *     summary: Get the system configuration
 *     tags: [Configuration]
 *     responses:
 *       200:
 *         description: Current configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemConfig'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/', protect, adminOnly, asyncHandler(updateConfig));
/**
 * @swagger
 * /api/configuration:
 *   put:
 *     summary: Update the system configuration (triggers module notifications)
 *     description: Updates system settings and notifies dependent modules (Billing, Reporting, Waste Tracking)
 *     tags: [Configuration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activeBillingModel:
 *                 type: string
 *                 description: Name of the active billing model (must exist in billingModels array)
 *                 example: Flat Fee
 *               billingModels:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/BillingModel'
 *               wasteCategories:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/WasteCategory'
 *               collectionRules:
 *                 $ref: '#/components/schemas/CollectionRules'
 *           example:
 *             activeBillingModel: "Flat Fee"
 *             billingModels:
 *               - { name: "Flat Fee", rate: 10 }
 *               - { name: "Weight-Based", rate: 0.5 }
 *             wasteCategories:
 *               - { key: "plastic", label: "Plastic" }
 *               - { key: "paper", label: "Paper" }
 *             collectionRules:
 *               frequency: "weekly"
 *               timeSlot: "08:00-12:00"
 *               maxBinsPerCollection: 2
 *     responses:
 *       200:
 *         description: Configuration updated successfully with module notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 config:
 *                   $ref: '#/components/schemas/SystemConfig'
 *                 notifications:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           module:
 *                             type: string
 *                           status:
 *                             type: string
 *                           message:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       422:
 *         description: Validation error (duplicate category key or invalid active billing model)
 */
router.delete('/', protect, adminOnly, asyncHandler(deleteConfig));
/**
 * @swagger
 * /api/configuration:
 *   delete:
 *     summary: Reset configuration to defaults (deletes document)
 *     tags: [Configuration]
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

// Waste Category Management Routes
router.get('/categories', protect, adminOnly, asyncHandler(getAllCategories));
/**
 * @swagger
 * /api/configuration/categories:
 *   get:
 *     summary: Get all waste categories
 *     tags: [Configuration]
 *     responses:
 *       200:
 *         description: List of categories
 */

router.post('/categories', protect, adminOnly, asyncHandler(addCategory));
/**
 * @swagger
 * /api/configuration/categories:
 *   post:
 *     summary: Add a new waste category
 *     tags: [Configuration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, label]
 *             properties:
 *               key:
 *                 type: string
 *                 example: e-waste
 *               label:
 *                 type: string
 *                 example: Electronic Waste
 *               description:
 *                 type: string
 *                 example: Computers, phones, etc.
 *     responses:
 *       201:
 *         description: Category created
 */

router.put('/categories/:id', protect, adminOnly, asyncHandler(updateCategory));
/**
 * @swagger
 * /api/configuration/categories/{id}:
 *   put:
 *     summary: Update a waste category
 *     tags: [Configuration]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               label:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated
 */

router.delete('/categories/:id', protect, adminOnly, asyncHandler(deleteCategory));
/**
 * @swagger
 * /api/configuration/categories/{id}:
 *   delete:
 *     summary: Delete a waste category
 *     tags: [Configuration]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */

module.exports = router;
