const driverService = require("../services/driverService");

// Create Driver
exports.createDriver = async (req, res) => {
  try {
    const driver = await driverService.createDriver(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) {
      filters.status = req.query.status;
    }
    const drivers = await driverService.getAllDrivers(filters);
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Driver By Id
exports.getDriverById = async (req, res) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Driver
exports.updateDriver = async (req, res) => {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Driver
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await driverService.deleteDriver(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json({ message: "Driver profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
