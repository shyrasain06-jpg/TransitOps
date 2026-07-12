const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");

exports.getDashboardKPIs = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const activeVehicles = await Vehicle.countDocuments({ status: "On Trip" });
    const availableVehicles = await Vehicle.countDocuments({ status: "Available" });
    const inShopVehicles = await Vehicle.countDocuments({ status: "In Shop" });
    const retiredVehicles = await Vehicle.countDocuments({ status: "Retired" });

    const activeTrips = await Trip.countDocuments({ status: "Dispatched" });
    const pendingTrips = await Trip.countDocuments({ status: "Draft" });
    const completedTrips = await Trip.countDocuments({ status: "Completed" });

    const driversOnDuty = await Driver.countDocuments({
      status: { $in: ["Available", "On Trip"] },
    });

    const fleetUtilization =
      totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

    res.json({
      activeVehicles,
      availableVehicles,
      inShopVehicles,
      retiredVehicles,
      totalVehicles,
      activeTrips,
      pendingTrips,
      completedTrips,
      driversOnDuty,
      fleetUtilization,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
