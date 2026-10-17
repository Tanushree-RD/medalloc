const { isEngineBuilt, getEngineExecutablePath } = require('../utils/engineBridge');

/**
 * Health service returns system status and engine readiness
 */
function getHealthStatus() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MedAlloc Backend API',
    engine: {
      compiled: isEngineBuilt(),
      path: getEngineExecutablePath()
    }
  };
}

module.exports = {
  getHealthStatus
};
