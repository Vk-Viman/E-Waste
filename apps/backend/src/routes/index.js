// Backend routes entry
const express = require('express');
const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.send('API Home');
});

// Residents route
const asyncHandler = require('../utils/asyncHandler');
router.get('/residents', asyncHandler(async (req, res) => {
  const db = req.app.locals.db; // Access the db from app.js
  const residents = await db.collection('Residents').find({}).toArray();
  res.json(residents);
}));

module.exports = router;
