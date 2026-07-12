const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All routes require authentication
router.use(protect);

router.post(
  "/",
  authorize(["Fleet Manager", "Financial Analyst", "Dispatcher"]),
  expenseController.createExpense
);

router.get("/", expenseController.getAllExpenses);

module.exports = router;
