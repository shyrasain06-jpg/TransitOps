const vehicleService = require("../services/vehicleService");

// Create
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);

    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();

    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get By Id
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.updateVehicle(
      req.params.id,
      req.body
    );

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete
exports.deleteVehicle = async (req, res) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);

    res.json({
      message: "Vehicle Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};