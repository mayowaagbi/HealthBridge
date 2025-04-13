// // utils/geocoding.js
// const { default: axios } = require("axios");

// async function reverseGeocode(lat, lng) {
//   try {
//     const response = await axios.get(
//       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
//     );
//     return (
//       response.data.results[0]?.formatted_address || "Address not available"
//     );
//   } catch (error) {
//     console.error("Geocoding error:", error);
//     return "Address not available";
//   }
// }

// module.exports = { reverseGeocode };
const axios = require("axios");

// Simple in-memory cache
const cache = new Map();

/**
 * Reverse geocode coordinates (latitude, longitude) to a human-readable address using Nominatim.
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @returns {Promise<string>} - Formatted address or a fallback message.
 */
async function reverseGeocode(lat, lng) {
  const cacheKey = `${lat},${lng}`;

  // Check if the result is already cached
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    // Extract the formatted address from the response
    const address = response.data.display_name || "Address not available";

    // Cache the result
    cache.set(cacheKey, address);

    return address;
  } catch (error) {
    console.error("Geocoding error:", error);
    return "Address not available";
  }
}

module.exports = { reverseGeocode };
