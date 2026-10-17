const { hospitals } = require('../utils/dataStore');

/**
 * Controller to fetch all connected hospitals
 */
function getHospitals(req, res) {
  try {
    return res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    console.error('[HospitalController] Error fetching hospitals:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve hospitals'
    });
  }
}

/**
 * Controller to fetch a single hospital by ID
 */
function getHospitalById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const hospital = hospitals.find(h => h.id === id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: `Hospital with ID ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    console.error('[HospitalController] Error fetching hospital:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve hospital details'
    });
  }
}

module.exports = {
  getHospitals,
  getHospitalById
};
