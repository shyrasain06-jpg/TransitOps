const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

router.get("/", dashboardController.getDashboardKPIs);

module.exports = router;
