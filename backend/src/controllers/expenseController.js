const expenseService = require("../services/expenseService");

// Create Expense
exports.createExpense = async (req, res) => {
  try {
    const expense = await expenseService.createExpense(req.body);
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const filters = {};
    if (req.query.vehicle) {
      filters.vehicle = req.query.vehicle;
    }
    if (req.query.type) {
      filters.type = req.query.type;
    }
    const expenses = await expenseService.getAllExpenses(filters);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
