const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(protect);

router.get(
  "/analytics",
  authorize(["Fleet Manager", "Financial Analyst"]),
  reportController.getAnalyticsReport
);

router.get(
  "/export",
  authorize(["Fleet Manager", "Financial Analyst"]),
  reportController.exportCSVReport
);

module.exports = router;
