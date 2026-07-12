const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(protect);

router.post(
  "/",
  authorize(["Fleet Manager", "Dispatcher", "Driver"]),
  tripController.createTrip
);

router.get("/", tripController.getAllTrips);

router.get("/:id", tripController.getTripById);

router.put(
  "/:id",
  authorize(["Fleet Manager", "Dispatcher", "Driver"]),
  tripController.updateTrip
);

router.post(
  "/:id/dispatch",
  authorize(["Fleet Manager", "Dispatcher", "Driver"]),
  tripController.dispatchTrip
);

router.post(
  "/:id/cancel",
  authorize(["Fleet Manager", "Dispatcher", "Driver"]),
  tripController.cancelTrip
);

router.post(
  "/:id/complete",
  authorize(["Fleet Manager", "Dispatcher", "Driver"]),
  tripController.completeTrip
);

module.exports = router;
