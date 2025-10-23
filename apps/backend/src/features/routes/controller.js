const RoutePlan = require('./model');
const Bin = require('../collections/model.bin');

/**
 * Calculate Euclidean distance between two coordinates
 * @param {Object} bin1 - First bin with latitude and longitude
 * @param {Object} bin2 - Second bin with latitude and longitude
 * @returns {number} Distance between the two bins
 */
function calculateDistance(bin1, bin2) {
  const latDiff = bin1.latitude - bin2.latitude;
  const lonDiff = bin1.longitude - bin2.longitude;
  return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
}

/**
 * Find the nearest unvisited bin to the current bin
 * @param {Object} currentBin - Current bin
 * @param {Array} unvisitedBins - Array of unvisited bins
 * @returns {Object} Nearest bin and its index
 */
function findNearestBin(currentBin, unvisitedBins) {
  let minDistance = Infinity;
  let nearestIndex = 0;
  
  for (let i = 0; i < unvisitedBins.length; i++) {
    const distance = calculateDistance(currentBin, unvisitedBins[i]);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
    }
  }
  
  return { bin: unvisitedBins[nearestIndex], index: nearestIndex };
}

async function listRoutes(_req, res) {
  const routes = await RoutePlan.find().sort({ createdAt: -1 });
  res.json(routes);
}

async function createRoute(req, res) {
  const route = await RoutePlan.create(req.body || {});
  res.status(201).json(route);
}

async function optimizeRoutes(req, res) {
  try {
    const { areaId } = req.body;
    
    // Fetch all bins for the specified area
    const query = areaId ? { areaId } : {};
    const bins = await Bin.find(query).lean();
    
    // If no bins found, return empty array
    if (!bins || bins.length === 0) {
      return res.json({ 
        optimizedRoute: [], 
        message: 'No bins found for the specified area' 
      });
    }
    
    // Filter bins that have valid coordinates
    const validBins = bins.filter(bin => 
      bin.latitude !== undefined && 
      bin.longitude !== undefined &&
      !isNaN(bin.latitude) &&
      !isNaN(bin.longitude)
    );
    
    if (validBins.length === 0) {
      return res.json({ 
        optimizedRoute: [], 
        message: 'No bins with valid coordinates found' 
      });
    }
    
    // Implement Nearest Neighbor algorithm
    const optimizedRoute = [];
    const unvisitedBins = [...validBins];
    
    // Start with the first bin
    optimizedRoute.push(unvisitedBins[0]);
    unvisitedBins.splice(0, 1);
    
    // Find nearest neighbor for each subsequent bin
    while (unvisitedBins.length > 0) {
      const currentBin = optimizedRoute[optimizedRoute.length - 1];
      const { bin: nearestBin, index } = findNearestBin(currentBin, unvisitedBins);
      optimizedRoute.push(nearestBin);
      unvisitedBins.splice(index, 1);
    }
    
    // Format the response
    const formattedRoute = optimizedRoute.map((bin, index) => ({
      order: index + 1,
      binId: bin.binId,
      location: bin.location,
      category: bin.category,
      latitude: bin.latitude,
      longitude: bin.longitude,
      areaId: bin.areaId
    }));
    
    res.json({ 
      optimizedRoute: formattedRoute,
      totalBins: formattedRoute.length,
      areaId: areaId || 'all'
    });
  } catch (error) {
    console.error('Error optimizing routes:', error);
    res.status(500).json({ 
      message: 'Error optimizing routes', 
      error: error.message 
    });
  }
}

module.exports = { listRoutes, createRoute, optimizeRoutes };
