const express = require('express');
const { getRequests, createRequest } = require('../controllers/requestController');

const router = express.Router();

// GET /api/requests
router.get('/', getRequests);

// POST /api/requests
router.post('/', createRequest);

module.exports = router;
