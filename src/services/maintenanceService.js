const MaintenanceLog = require("../models/MaintenanceLog");
const Vehicle = require("../models/Vehicle");
const Expense = require("../models/Expense");

// Log Maintenance
const logMaintenance = async (data) => {
  const { vehicleId, description, cost, startDate } = data;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  // A vehicle can only enter maintenance if it's not Retired or On Trip
  if (vehicle.status === "Retired") {
    throw new Error("Cannot place a retired vehicle in maintenance");
  }
  if (vehicle.status === "On Trip") {
    throw new Error("Vehicle is currently on a trip and cannot be placed in maintenance");
  }

  // Create active Maintenance Log
  const maintenanceLog = await MaintenanceLog.create({
    vehicle: vehicleId,
    description,
    cost,
    startDate: startDate || new Date(),
    status: "Active",
  });

  // Switch vehicle status to "In Shop"
  vehicle.status = "In Shop";
  await vehicle.save();

  return maintenanceLog;
};

// Close Maintenance
const closeMaintenance = async (id, data) => {
  const { endDate, cost } = data;

  const maintenanceLog = await MaintenanceLog.findById(id).populate("vehicle");
  if (!maintenanceLog) {
    throw new Error("Maintenance log not found");
  }

  if (maintenanceLog.status !== "Active") {
    throw new Error("Maintenance log is already closed");
  }

  // Update Maintenance Log details
  maintenanceLog.status = "Closed";
  maintenanceLog.endDate = endDate || new Date();
  if (cost !== undefined) {
    maintenanceLog.cost = cost;
  }
  await maintenanceLog.save();

  const vehicle = maintenanceLog.vehicle;

  // Restore vehicle status to Available (unless it has been Retired)
  if (vehicle.status === "In Shop") {
    vehicle.status = "Available";
    await vehicle.save();
  }

  // Create corresponding Expense entry
  await Expense.create({
    vehicle: vehicle._id,
    type: "Maintenance",
    amount: maintenanceLog.cost,
    description: `Maintenance: ${maintenanceLog.description} (Log ID: ${maintenanceLog._id})`,
    date: maintenanceLog.endDate,
  });

  return maintenanceLog;
};

// Get All Maintenance Logs
const getAllMaintenanceLogs = async (filter = {}) => {
  return await MaintenanceLog.find(filter).populate("vehicle");
};

module.exports = {
  logMaintenance,
  closeMaintenance,
  getAllMaintenanceLogs,
};
