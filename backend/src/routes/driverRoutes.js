const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All routes are protected
router.use(protect);

router.post(
  "/",
  authorize(["Fleet Manager", "Safety Officer"]),
  driverController.createDriver
);

router.get("/", driverController.getAllDrivers);

router.get("/:id", driverController.getDriverById);

router.put(
  "/:id",
  authorize(["Fleet Manager", "Safety Officer"]),
  driverController.updateDriver
);

router.delete(
  "/:id",
  authorize(["Fleet Manager"]),
  driverController.deleteDriver
);

module.exports = router;
