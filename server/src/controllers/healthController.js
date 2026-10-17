/**
 * Controller for health check endpoints
 */

function checkHealth(req, res) {
  // Returns standard health check format required by MedAlloc
  return res.status(200).json({
    status: 'ok'
  });
}

module.exports = {
  checkHealth
};
