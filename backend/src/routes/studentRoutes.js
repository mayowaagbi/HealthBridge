const express = require("express");
const StudentController = require("../controllers/StudentController");

const router = express.Router();

router.get("/", StudentController.getStudents);
router.get(
  "/users/:userId/student-details",
  StudentController.getStudentByUserId
);
router.get(
  "/users/:userId/provider-details",
  StudentController.getProviderByUserId
);
module.exports = router;
