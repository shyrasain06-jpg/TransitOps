const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const FuelLog = require("../models/FuelLog");
const Expense = require("../models/Expense");

// Create Trip
const createTrip = async (data) => {
  const trip = await Trip.create(data);
  return trip;
};

// Get All Trips
const getAllTrips = async (filter = {}) => {
  return await Trip.find(filter)
    .populate("vehicle")
    .populate("driver");
};

// Get Trip By Id
const getTripById = async (id) => {
  return await Trip.findById(id)
    .populate("vehicle")
    .populate("driver");
};

// Update Trip
const updateTrip = async (id, data) => {
  return await Trip.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

// Dispatch Trip
const dispatchTrip = async (id) => {
  const trip = await Trip.findById(id).populate("vehicle").populate("driver");
  if (!trip) {
    throw new Error("Trip not found");
  }

  if (trip.status !== "Draft") {
    throw new Error(`Cannot dispatch trip in ${trip.status} status`);
  }

  const { vehicle, driver, cargoWeight } = trip;

  // 1. Validate Vehicle status is Available (not Retired or In Shop or On Trip)
  if (vehicle.status !== "Available") {
    throw new Error(`Vehicle ${vehicle.registrationNumber} is not available (Status: ${vehicle.status})`);
  }

  // 2. Validate Driver status is Available
  if (driver.status !== "Available") {
    throw new Error(`Driver ${driver.name} is not available (Status: ${driver.status})`);
  }

  // 3. Validate Driver license is not expired
  const now = new Date();
  if (new Date(driver.licenseExpiryDate) < now) {
    throw new Error(`Driver ${driver.name} has an expired driving license (Expired on: ${driver.licenseExpiryDate.toDateString()})`);
  }

  // 4. Validate Cargo Weight <= Vehicle's Max Load capacity
  if (cargoWeight > vehicle.maxLoad) {
    throw new Error(`Cargo weight (${cargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxLoad} kg)`);
  }

  // Atomically update trip, vehicle, and driver status
  trip.status = "Dispatched";
  trip.dispatchDate = new Date();
  await trip.save();

  vehicle.status = "On Trip";
  await vehicle.save();

  driver.status = "On Trip";
  await driver.save();

  return trip;
};

// Cancel Trip
const cancelTrip = async (id) => {
  const trip = await Trip.findById(id).populate("vehicle").populate("driver");
  if (!trip) {
    throw new Error("Trip not found");
  }

  if (trip.status !== "Dispatched") {
    throw new Error(`Only dispatched trips can be cancelled. Current status: ${trip.status}`);
  }

  const { vehicle, driver } = trip;

  trip.status = "Cancelled";
  await trip.save();

  // Restore status to Available
  if (vehicle.status === "On Trip") {
    vehicle.status = "Available";
    await vehicle.save();
  }

  if (driver.status === "On Trip") {
    driver.status = "Available";
    await driver.save();
  }

  return trip;
};

// Complete Trip
const completeTrip = async (id, data) => {
  const { finalOdometer, fuelConsumed, fuelCost, actualDistance, revenue } = data;

  const trip = await Trip.findById(id).populate("vehicle").populate("driver");
  if (!trip) {
    throw new Error("Trip not found");
  }

  if (trip.status !== "Dispatched") {
    throw new Error(`Only dispatched trips can be completed. Current status: ${trip.status}`);
  }

  const { vehicle, driver } = trip;

  // Validate Odometer reading
  if (finalOdometer && finalOdometer < vehicle.odometer) {
    throw new Error(`Final odometer (${finalOdometer}) cannot be less than current vehicle odometer (${vehicle.odometer})`);
  }

  // Update Trip
  trip.status = "Completed";
  trip.actualDistance = actualDistance || trip.plannedDistance;
  trip.finalOdometer = finalOdometer || (vehicle.odometer + (actualDistance || trip.plannedDistance));
  trip.fuelConsumed = fuelConsumed || 0;
  trip.revenue = revenue || 0;
  trip.completionDate = new Date();
  await trip.save();

  // Update Vehicle
  vehicle.status = "Available";
  if (finalOdometer) {
    vehicle.odometer = finalOdometer;
  } else {
    vehicle.odometer += actualDistance || trip.plannedDistance;
  }
  await vehicle.save();

  // Update Driver
  driver.status = "Available";
  await driver.save();

  // Log Fuel Log & Fuel Expense if recorded
  if (fuelConsumed && fuelConsumed > 0) {
    const cost = fuelCost || 0;
    
    // Create Fuel Log
    await FuelLog.create({
      vehicle: vehicle._id,
      liters: fuelConsumed,
      cost: cost,
      date: new Date(),
      trip: trip._id,
    });

    // Create Expense
    await Expense.create({
      vehicle: vehicle._id,
      type: "Fuel",
      amount: cost,
      description: `Fuel log for completed trip ${trip._id} (${fuelConsumed} Liters)`,
      date: new Date(),
      trip: trip._id,
    });
  }

  return trip;
};

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  dispatchTrip,
  cancelTrip,
  completeTrip,
};
