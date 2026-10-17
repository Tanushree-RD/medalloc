const express = require('express');
const { allocateResource } = require('../controllers/allocatorController');

const router = express.Router();

// POST /api/allocate
router.post('/allocate', allocateResource);

module.exports = router;
