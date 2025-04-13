const geoService = require("../services/geoService");
const processLocation = async (req, res) => {
  const { lat, lng } = req.body; // Match what frontend is sending
  const userId = req.user.id;
  console.log("Received request:", { userId, lat, lng });

  if (!userId || lat === undefined || lng === undefined) {
    console.error("Missing userId or location data:", {
      userId,
      lat,
      lng,
    });
    return res.status(400).json({ error: "Missing userId or location data" });
  }

  try {
    const location = { lat, lng };
    const result = await geoService.processLocation(userId, location);
    console.log("Location processed successfully:", result);
    return res.json(result);
  } catch (error) {
    console.error("Error processing location:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const resetStepCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await geoService.resetStepCount(userId);

    return res.status(200).json({
      success: true,
      message: "Step count reset successfully",
      data: result,
    });
  } catch (error) {
    console.error(`Reset step count error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
// const processLocation = async (req, res) => {
//   const { location, longitude, latitude } = req.body;
//   const userId = req.user.id; // Assuming userId is obtained from the request object
//   console.log("Received requestw:", { userId, location });

//   if (!userId || !location?.lat || !location?.lng) {
//     console.error("Missing userId or location data:", {
//       userId,
//       location,
//       longitude,
//       latitude,
//     });
//     return res.status(400).json({ error: "Missing userId or location data" });
//   }

//   try {
//     const result = await geoService.processLocation(userId, location);
//     console.log("Location processed successfully:", result);
//     return res.json(result);
//   } catch (error) {
//     console.error("Error processing location:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// const getProgress = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     // If progress is part of geoService; otherwise, replace with the correct service
//     const progress = await geoService.getProgress(userId);
//     return res.status(200).json(progress);
//   } catch (error) {
//     console.error("Error fetching progress:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };
const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await geoService.getProgress(userId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: "No step data found",
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error(`GeoController error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { processLocation, getProgress, resetStepCount };
