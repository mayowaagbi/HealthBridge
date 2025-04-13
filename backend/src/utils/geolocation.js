function calculateDistance(pos1, pos2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (pos1.latitude * Math.PI) / 180;
  const φ2 = (pos2.latitude * Math.PI) / 180;
  const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
  const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function metersToSteps(distanceInMeters) {
  const averageStepLength = 0.762; // Average step length in meters (30 inches)
  return Math.round(distanceInMeters / averageStepLength);
}

module.exports = { calculateDistance, metersToSteps };
