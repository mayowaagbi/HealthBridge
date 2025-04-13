const geoModel = require("../models/geoModel");
const UserModel = require("../models/User");
const { calculateDistance, metersToSteps } = require("../utils/geolocation");

// Constants
const MIN_STEPS = 10000;
const MIN_DISTANCE_THRESHOLD = 30; // Increased from 5 to 30 meters to reduce false positives

class GeoService {
  async processLocation(userId, location) {
    console.log("Processing location for user:", userId, location);

    if (!userId || !location.lat || !location.lng) {
      throw new Error("Invalid input parameters");
    }

    const prevLocation = await geoModel.getPreviousLocation(userId);
    console.log("Previous location:", prevLocation);

    // Save new location regardless
    const newLocation = await geoModel.saveNewLocation(userId, location);
    console.log("New location saved:", newLocation);

    let stepsAdded = 0;
    let totalSteps = 0;

    if (prevLocation) {
      const distance = calculateDistance(
        { latitude: prevLocation.latitude, longitude: prevLocation.longitude },
        { latitude: location.lat, longitude: location.lng }
      );
      console.log("Distance calculated:", distance);

      // Only count steps if distance is significant (30 meters instead of 5)
      if (distance >= MIN_DISTANCE_THRESHOLD) {
        // Check for unrealistic movement (teleportation)
        const MAX_REALISTIC_MOVEMENT = 500; // 500 meters in one update is suspicious
        const timeDiff =
          (newLocation.timestamp - prevLocation.timestamp) / 1000; // seconds

        if (distance > MAX_REALISTIC_MOVEMENT && timeDiff < 60) {
          console.log(
            `Suspicious movement detected: ${distance.toFixed(
              2
            )}m in ${timeDiff.toFixed(2)}s`
          );
          // Don't count steps for suspicious movement
        } else {
          stepsAdded = metersToSteps(distance);
          // Cap the steps added to a reasonable amount per movement
          const MAX_STEPS_PER_MOVEMENT = 200;
          if (stepsAdded > MAX_STEPS_PER_MOVEMENT) {
            console.log(
              `Capping steps from ${stepsAdded} to ${MAX_STEPS_PER_MOVEMENT}`
            );
            stepsAdded = MAX_STEPS_PER_MOVEMENT;
          }

          totalSteps = (await geoModel.upsertStepEntry(userId, stepsAdded))
            .steps;
          console.log("Steps added:", stepsAdded);
          console.log("Total steps:", totalSteps);
        }
      } else {
        console.log(
          `Distance ${distance.toFixed(
            2
          )}m below threshold of ${MIN_DISTANCE_THRESHOLD}m, no steps added`
        );
      }
    }

    return { stepsAdded, totalSteps, location: newLocation };
  }

  async getProgress(userId) {
    try {
      console.log(`Fetching step progress for user: ${userId}`);

      // Get step goal from user profile
      const user = await UserModel.findById(userId);
      if (!user) {
        console.error(`User not found: ${userId}`);
        throw new Error("User not found");
      }

      const target = user.stepGoal || MIN_STEPS;
      console.log(`Step goal for user ${userId}: ${target}`);

      // Get current steps
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      console.log(`Fetching steps for date: ${today.toISOString()}`);

      const stepsEntry = await geoModel.getStepsByDate(userId, today);
      console.log(`Steps entry: ${JSON.stringify(stepsEntry)}`);

      const current = stepsEntry?.steps || 0;
      console.log(`Current steps: ${current}`);

      // Calculate progress
      const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

      return { current, target, progress };
    } catch (error) {
      console.error(`Error in GeoService.getProgress: ${error.message}`);
      console.error(error.stack);
      throw new Error("Failed to fetch step progress");
    }
  }

  async resetStepCount(userId) {
    try {
      console.log(`Resetting step count for user: ${userId}`);

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Update the step entry for today to 0
      const result = await geoModel.updateStepEntry(userId, today, 0);
      console.log(`Reset result: ${JSON.stringify(result)}`);

      return result;
    } catch (error) {
      console.error(`Error in GeoService.resetStepCount: ${error.message}`);
      console.error(error.stack);
      throw new Error("Failed to reset step count");
    }
  }
}

module.exports = new GeoService();
