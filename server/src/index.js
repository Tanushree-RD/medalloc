const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const { checkHealth } = require('./controllers/healthController');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// CORS configuration
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Direct /health route as explicitly specified in requirements
app.get('/health', checkHealth);

// API router mounted under /api
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[MedAlloc Server Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start listening if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[MedAlloc Server] Running on http://localhost:${PORT}`);
    console.log(`[MedAlloc Server] Health check available at http://localhost:${PORT}/health`);
  });
}

module.exports = app;
