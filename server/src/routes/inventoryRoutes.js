const express = require('express');
const { getInventory } = require('../controllers/inventoryController');

const router = express.Router();

// GET /api/inventory
router.get('/', getInventory);

module.exports = router;
