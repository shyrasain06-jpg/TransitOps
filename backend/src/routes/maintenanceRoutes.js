const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(protect);

router.post(
  "/",
  authorize(["Fleet Manager"]),
  maintenanceController.logMaintenance
);

router.put(
  "/:id/close",
  authorize(["Fleet Manager"]),
  maintenanceController.closeMaintenance
);

router.get("/", maintenanceController.getAllMaintenanceLogs);

module.exports = router;
