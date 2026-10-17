const { inventory } = require('../utils/dataStore');

/**
 * Controller to fetch live healthcare inventory
 */
function getInventory(req, res) {
  try {
    const totalItems = inventory.reduce((acc, curr) => acc + curr.stock, 0);
    const lowStockCount = inventory.filter(i => i.status === 'Low' || i.stock <= i.minThreshold).length;

    // Grouping by category
    const categories = inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.stock;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      count: inventory.length,
      totalUnits: totalItems,
      lowStockCount,
      categories,
      lastUpdated: new Date().toISOString(),
      data: inventory
    });
  } catch (error) {
    console.error('[InventoryController] Error fetching inventory:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve inventory data'
    });
  }
}

module.exports = {
  getInventory
};
