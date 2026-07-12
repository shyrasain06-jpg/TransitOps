const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const Expense = require("../models/Expense");

// Get Analytics Reports
exports.getAnalyticsReport = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const reports = [];

    for (let vehicle of vehicles) {
      // 1. Get Completed Trips for Vehicle to compute distance, fuel, and revenue
      const completedTrips = await Trip.find({
        vehicle: vehicle._id,
        status: "Completed",
      });

      const totalDistance = completedTrips.reduce(
        (sum, t) => sum + (t.actualDistance || 0),
        0
      );
      const totalFuelConsumed = completedTrips.reduce(
        (sum, t) => sum + (t.fuelConsumed || 0),
        0
      );
      const totalTripRevenue = completedTrips.reduce(
        (sum, t) => sum + (t.revenue || 0),
        0
      );

      // Fuel Efficiency = Distance / Fuel
      const fuelEfficiency =
        totalFuelConsumed > 0 ? (totalDistance / totalFuelConsumed).toFixed(2) : 0;

      // 2. Get Expenses (Fuel, Maintenance, Toll, Other)
      const expenses = await Expense.find({ vehicle: vehicle._id });
      const fuelExpenses = expenses
        .filter((e) => e.type === "Fuel")
        .reduce((sum, e) => sum + e.amount, 0);
      const maintenanceExpenses = expenses
        .filter((e) => e.type === "Maintenance")
        .reduce((sum, e) => sum + e.amount, 0);
      const tollAndOtherExpenses = expenses
        .filter((e) => e.type === "Toll" || e.type === "Other")
        .reduce((sum, e) => sum + e.amount, 0);

      const totalOperationalCost = fuelExpenses + maintenanceExpenses + tollAndOtherExpenses;

      // 3. ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      // Note: operational cost includes fuel and maintenance. Let's use the exact formula from requirements:
      // ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      const costForRoi = maintenanceExpenses + fuelExpenses;
      const acquisitionCost = vehicle.acquisitionCost || 1; // Avoid divide by zero
      const vehicleRoi = ((totalTripRevenue - costForRoi) / acquisitionCost).toFixed(4);
      const vehicleRoiPercent = (vehicleRoi * 100).toFixed(2);

      reports.push({
        vehicleId: vehicle._id,
        vehicleName: vehicle.vehicleName,
        registrationNumber: vehicle.registrationNumber,
        type: vehicle.type,
        status: vehicle.status,
        odometer: vehicle.odometer,
        acquisitionCost: vehicle.acquisitionCost,
        totalDistance,
        totalFuelConsumed,
        fuelEfficiency: Number(fuelEfficiency),
        fuelExpenses,
        maintenanceExpenses,
        tollAndOtherExpenses,
        totalOperationalCost,
        totalRevenue: totalTripRevenue,
        roiPercent: Number(vehicleRoiPercent),
      });
    }

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export CSV Report
exports.exportCSVReport = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    
    let csvContent = "Registration Number,Vehicle Name,Type,Status,Odometer,Acquisition Cost,Total Distance (km),Total Fuel Consumed (L),Fuel Efficiency (km/L),Fuel Expenses (INR),Maintenance Expenses (INR),Tolls & Other (INR),Total Operational Cost (INR),Revenue (INR),ROI (%)\n";

    for (let vehicle of vehicles) {
      const completedTrips = await Trip.find({
        vehicle: vehicle._id,
        status: "Completed",
      });

      const totalDistance = completedTrips.reduce(
        (sum, t) => sum + (t.actualDistance || 0),
        0
      );
      const totalFuelConsumed = completedTrips.reduce(
        (sum, t) => sum + (t.fuelConsumed || 0),
        0
      );
      const totalTripRevenue = completedTrips.reduce(
        (sum, t) => sum + (t.revenue || 0),
        0
      );

      const fuelEfficiency =
        totalFuelConsumed > 0 ? (totalDistance / totalFuelConsumed).toFixed(2) : 0;

      const expenses = await Expense.find({ vehicle: vehicle._id });
      const fuelExpenses = expenses
        .filter((e) => e.type === "Fuel")
        .reduce((sum, e) => sum + e.amount, 0);
      const maintenanceExpenses = expenses
        .filter((e) => e.type === "Maintenance")
        .reduce((sum, e) => sum + e.amount, 0);
      const tollAndOtherExpenses = expenses
        .filter((e) => e.type === "Toll" || e.type === "Other")
        .reduce((sum, e) => sum + e.amount, 0);

      const totalOperationalCost = fuelExpenses + maintenanceExpenses + tollAndOtherExpenses;

      const costForRoi = maintenanceExpenses + fuelExpenses;
      const acquisitionCost = vehicle.acquisitionCost || 1;
      const vehicleRoiPercent = (((totalTripRevenue - costForRoi) / acquisitionCost) * 100).toFixed(2);

      csvContent += `"${vehicle.registrationNumber}","${vehicle.vehicleName}","${vehicle.type}","${vehicle.status}",${vehicle.odometer},${vehicle.acquisitionCost},${totalDistance},${totalFuelConsumed},${fuelEfficiency},${fuelExpenses},${maintenanceExpenses},${tollAndOtherExpenses},${totalOperationalCost},${totalTripRevenue},${vehicleRoiPercent}\n`;
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transitops_fleet_analytics.csv");
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
