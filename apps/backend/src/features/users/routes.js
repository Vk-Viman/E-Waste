const { Router } = require('express');
const { listUsers, createUser } = require('./controller');
const { requireRole } = require('../auth/service');
const { protect } = require('../../middleware/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = Router();

// users router

router.get('/', protect, requireRole('admin'), asyncHandler(listUsers));
router.post('/', protect, requireRole('admin'), asyncHandler(createUser));

module.exports = router;
