const maintenanceService = require("../services/maintenanceService");

// Log Maintenance
exports.logMaintenance = async (req, res) => {
  try {
    const log = await maintenanceService.logMaintenance(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Close Maintenance
exports.closeMaintenance = async (req, res) => {
  try {
    const log = await maintenanceService.closeMaintenance(
      req.params.id,
      req.body
    );
    res.json({
      message: "Maintenance closed successfully",
      log,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Maintenance Logs
exports.getAllMaintenanceLogs = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) {
      filters.status = req.query.status;
    }
    if (req.query.vehicle) {
      filters.vehicle = req.query.vehicle;
    }
    const logs = await maintenanceService.getAllMaintenanceLogs(filters);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
