const Expense = require("../models/Expense");
const Vehicle = require("../models/Vehicle");
const mongoose = require("mongoose");

// Create Expense
const createExpense = async (data) => {
  const expense = await Expense.create(data);
  return expense;
};

// Get All Expenses
const getAllExpenses = async (filter = {}) => {
  return await Expense.find(filter).populate("vehicle").populate("trip");
};

// Compute Total Operational Cost (Fuel + Maintenance + Tolls + Others) per vehicle
const getOperationalCostPerVehicle = async (vehicleId) => {
  const result = await Expense.aggregate([
    {
      $match: {
        vehicle: new mongoose.Types.ObjectId(vehicleId),
      },
    },
    {
      $group: {
        _id: "$vehicle",
        totalCost: { $sum: "$amount" },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalCost : 0;
};

module.exports = {
  createExpense,
  getAllExpenses,
  getOperationalCostPerVehicle,
};
