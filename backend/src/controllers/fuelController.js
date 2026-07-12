const fuelService = require("../services/fuelService");

// Create Fuel Log
exports.createFuelLog = async (req, res) => {
  try {
    const fuelLog = await fuelService.createFuelLog(req.body);
    res.status(201).json(fuelLog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Fuel Logs
exports.getAllFuelLogs = async (req, res) => {
  try {
    const filters = {};
    if (req.query.vehicle) {
      filters.vehicle = req.query.vehicle;
    }
    const logs = await fuelService.getAllFuelLogs(filters);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
