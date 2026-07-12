const Driver = require("../models/Driver");

// Create Driver
const createDriver = async (data) => {
  const driver = await Driver.create(data);
  return driver;
};

// Get All Drivers
const getAllDrivers = async (filter = {}) => {
  return await Driver.find(filter);
};

// Get Driver By Id
const getDriverById = async (id) => {
  return await Driver.findById(id);
};

// Update Driver
const updateDriver = async (id, data) => {
  return await Driver.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

// Delete Driver
const deleteDriver = async (id) => {
  return await Driver.findByIdAndDelete(id);
};

module.exports = {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
};
