const express = require('express');
const router = express.Router();

// Simple in-memory storage (you can use MongoDB if preferred)
let menuAvailability = {};

// Get all availability status
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: menuAvailability
  });
});

// Update availability
router.post('/:itemId', (req, res) => {
  const { itemId } = req.params;
  const { isAvailable } = req.body;
  
  menuAvailability[itemId] = isAvailable;
  
  res.json({
    success: true,
    message: `Item ${itemId} ${isAvailable ? 'enabled' : 'disabled'}`
  });
});

// Bulk update
router.post('/', (req, res) => {
  const { availability } = req.body;
  menuAvailability = { ...menuAvailability, ...availability };
  
  res.json({
    success: true,
    message: 'Availability updated'
  });
});

module.exports = router;