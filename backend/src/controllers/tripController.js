const tripService = require("../services/tripService");

// Create Trip
exports.createTrip = async (req, res) => {
  try {
    const trip = await tripService.createTrip(req.body);
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Trips
exports.getAllTrips = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) {
      filters.status = req.query.status;
    }
    const trips = await tripService.getAllTrips(filters);
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Trip By Id
exports.getTripById = async (req, res) => {
  try {
    const trip = await tripService.getTripById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Trip
exports.updateTrip = async (req, res) => {
  try {
    const trip = await tripService.updateTrip(req.params.id, req.body);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dispatch Trip
exports.dispatchTrip = async (req, res) => {
  try {
    const trip = await tripService.dispatchTrip(req.params.id);
    res.json({
      message: "Trip dispatched successfully",
      trip,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cancel Trip
exports.cancelTrip = async (req, res) => {
  try {
    const trip = await tripService.cancelTrip(req.params.id);
    res.json({
      message: "Trip cancelled successfully",
      trip,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Complete Trip
exports.completeTrip = async (req, res) => {
  try {
    const trip = await tripService.completeTrip(req.params.id, req.body);
    res.json({
      message: "Trip completed successfully",
      trip,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
