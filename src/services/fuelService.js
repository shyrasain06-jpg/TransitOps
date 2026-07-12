const FuelLog = require("../models/FuelLog");
const Expense = require("../models/Expense");
const Vehicle = require("../models/Vehicle");

// Create Fuel Log
const createFuelLog = async (data) => {
  const { vehicleId, liters, cost, date, tripId } = data;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  const fuelLog = await FuelLog.create({
    vehicle: vehicleId,
    liters,
    cost,
    date: date || new Date(),
    trip: tripId,
  });

  // Create corresponding Expense
  await Expense.create({
    vehicle: vehicleId,
    type: "Fuel",
    amount: cost,
    description: `Fuel Purchase: ${liters} Liters (Log ID: ${fuelLog._id})`,
    date: date || new Date(),
    trip: tripId,
  });

  return fuelLog;
};

// Get All Fuel Logs
const getAllFuelLogs = async (filter = {}) => {
  return await FuelLog.find(filter).populate("vehicle").populate("trip");
};

module.exports = {
  createFuelLog,
  getAllFuelLogs,
};
