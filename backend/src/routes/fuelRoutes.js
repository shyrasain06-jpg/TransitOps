const express = require("express");
const router = express.Router();
const fuelController = require("../controllers/fuelController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(protect);

router.post(
  "/",
  authorize(["Fleet Manager", "Dispatcher", "Driver", "Financial Analyst"]),
  fuelController.createFuelLog
);

router.get("/", fuelController.getAllFuelLogs);

module.exports = router;
