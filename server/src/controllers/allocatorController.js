const { runAllocatorEngine } = require('../services/allocatorService');

/**
 * Controller handling allocation requests
 * Forwards input JSON payload to C engine and returns engine output
 */
async function allocateResource(req, res) {
  try {
    const payload = req.body || {};
    const result = await runAllocatorEngine(payload);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[AllocatorController] Error executing engine:', error);
    const statusCode = error.code === 'ENGINE_NOT_FOUND' ? 503 : 500;
    return res.status(statusCode).json({
      success: false,
      message: 'Failed to process allocation through C engine',
      ...error
    });
  }
}

module.exports = {
  allocateResource
};
