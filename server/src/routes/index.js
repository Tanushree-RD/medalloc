const express = require('express');
const healthRoutes = require('./healthRoutes');
const allocatorRoutes = require('./allocatorRoutes');

const router = express.Router();

// Mount health check: GET /api/health
router.use('/health', healthRoutes);

// Mount allocator endpoints: POST /api/allocate
router.use('/', allocatorRoutes);

module.exports = router;
