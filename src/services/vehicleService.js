const Vehicle = require("../models/Vehicle");

// Create Vehicle
const createVehicle = async (data) => {
  const vehicle = await Vehicle.create(data);
  return vehicle;
};

// Get All Vehicles
const getAllVehicles = async () => {
  return await Vehicle.find();
};

// Get Vehicle By Id
const getVehicleById = async (id) => {
  return await Vehicle.findById(id);
};

// Update Vehicle
const updateVehicle = async (id, data) => {
  return await Vehicle.findByIdAndUpdate(id, data, {
    new: true,
  });
};

// Delete Vehicle
const deleteVehicle = async (id) => {
  return await Vehicle.findByIdAndDelete(id);
};

module.exports = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};