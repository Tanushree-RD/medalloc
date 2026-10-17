const express = require('express');
const healthRoutes = require('./healthRoutes');
const allocatorRoutes = require('./allocatorRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const hospitalRoutes = require('./hospitalRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const requestRoutes = require('./requestRoutes');
const analyticsRoutes = require('./analyticsRoutes');

const router = express.Router();

// Mount health check: GET /api/health
router.use('/health', healthRoutes);

// Mount dashboard: GET /api/dashboard/stats
router.use('/dashboard', dashboardRoutes);

// Mount hospitals: GET /api/hospitals
router.use('/hospitals', hospitalRoutes);

// Mount inventory: GET /api/inventory
router.use('/inventory', inventoryRoutes);

// Mount requests: GET /api/requests, POST /api/requests
router.use('/requests', requestRoutes);

// Mount analytics: GET /api/analytics
router.use('/analytics', analyticsRoutes);

// Mount allocator endpoints: POST /api/allocate
router.use('/', allocatorRoutes);

module.exports = router;
