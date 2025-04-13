const express = require("express");
const router = express.Router();
const AmbulanceController = require("../controllers/ambulanceController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

module.exports = (io) => {
  router.use(authenticate);

  // Create a new ambulance request
  router.post("/", authorize("STUDENT"), (req, res) =>
    AmbulanceController.createRequest(req, res, io)
  );

  // Get all ambulance requests (for providers)
  router.get(
    "/",
    authorize("PROVIDER"),
    AmbulanceController.getallAmbulanceRequests
  );

  // Get ambulance requests for the logged-in user
  router.get("/user", AmbulanceController.getUserRequests);

  // Resolve an ambulance request
  router.patch("/:id/resolve", (req, res) =>
    AmbulanceController.resolveRequest(req, res, io)
  );

  return router;
};
