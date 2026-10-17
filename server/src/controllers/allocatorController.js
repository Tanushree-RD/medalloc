const { runAllocatorEngine } = require('../services/allocatorService');
const { requests } = require('../utils/dataStore');

/**
 * Controller handling allocation requests
 * Forwards input JSON payload to C engine and returns enriched allocation response
 */
async function allocateResource(req, res) {
  try {
    const payload = req.body || {};
    const engineResult = await runAllocatorEngine(payload);

    // Primary matched result (first result in results array)
    const primaryResult = (engineResult.results && engineResult.results.length > 0)
      ? engineResult.results[0]
      : null;

    const assignedHospital = primaryResult ? primaryResult.hospital : 'None';
    const distance = primaryResult && primaryResult.distance !== undefined ? primaryResult.distance : 0;
    const allocationStatus = primaryResult ? primaryResult.status : 'Failed';
    const estimatedResponseTime = allocationStatus === 'Allocated'
      ? `${Math.max(3, Math.round(distance * 1.6 + 2))} mins`
      : 'N/A';

    // Store in live requests list
    if (payload.patientName) {
      const storedReq = {
        id: `REQ-${100 + requests.length + 1}`,
        patientName: payload.patientName,
        patientLocation: payload.hospital || 'City Hospital',
        resourceType: payload.resource || payload.resourceType || 'A+ Blood',
        quantity: payload.quantity || 1,
        priority: payload.priority || 'High',
        assignedHospital,
        distanceKm: distance,
        allocationStatus,
        estimatedResponseTime,
        timestamp: new Date().toISOString()
      };
      requests.unshift(storedReq);
    }

    return res.status(200).json({
      success: true,
      assignedHospital,
      distance,
      allocationStatus,
      estimatedResponseTime,
      ...engineResult
    });
  } catch (error) {
    console.error('[AllocatorController] Error executing engine:', error);
    const statusCode = error.code === 'ENGINE_NOT_FOUND' ? 503 : 500;
    return res.status(statusCode).json({
      success: false,
      message: 'Failed to process allocation through C engine',
      error: error.error || error.message || 'Engine execution failed',
      details: error
    });
  }
}

module.exports = {
  allocateResource
};
