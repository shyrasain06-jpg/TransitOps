require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const app = require("../app");

// Utility to make HTTP requests using node native fetch
const request = async (url, options = {}) => {
  if (options.body && typeof options.body === "object") {
    options.body = JSON.stringify(options.body);
  }
  if (!options.headers) {
    options.headers = {};
  }
  options.headers["Content-Type"] = "application/json";

  const response = await fetch(url, options);
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  return {
    status: response.status,
    headers: response.headers,
    data,
  };
};

const runTests = async () => {
  let server;
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Start Express server on a random free port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`Express server listening programmatically on ${baseUrl}`);

    console.log("\n=================== STARTING E2E BACKEND TESTS ===================\n");

    // 1. REGISTER USERS
    console.log("1. Registering Users for different roles...");
    const regManager = await request(`${baseUrl}/api/auth/register`, {
      method: "POST",
      body: {
        name: "Test Manager",
        email: `manager_${Date.now()}@test.com`,
        password: "password123",
        role: "Fleet Manager",
      },
    });
    if (regManager.status !== 201) throw new Error(`Manager registration failed: ${JSON.stringify(regManager.data)}`);
    const managerToken = regManager.data.token;
    console.log("Manager registered successfully.");

    const regDispatcher = await request(`${baseUrl}/api/auth/register`, {
      method: "POST",
      body: {
        name: "Test Dispatcher",
        email: `dispatcher_${Date.now()}@test.com`,
        password: "password123",
        role: "Dispatcher",
      },
    });
    if (regDispatcher.status !== 201) throw new Error("Dispatcher registration failed");
    const dispatcherToken = regDispatcher.data.token;
    console.log("Dispatcher registered successfully.");

    // 2. CREATE VEHICLE (Fleet Manager)
    console.log("\n2. Creating test vehicle 'Van-05' (Max load: 500kg)...");
    const vehicleRes = await request(`${baseUrl}/api/vehicles`, {
      method: "POST",
      headers: { Authorization: `Bearer ${managerToken}` },
      body: {
        registrationNumber: `REG-${Date.now()}`,
        vehicleName: "Van-05",
        type: "Van",
        maxLoad: 500,
        odometer: 10000,
        acquisitionCost: 600000,
        status: "Available",
      },
    });
    if (vehicleRes.status !== 201) throw new Error(`Vehicle creation failed: ${JSON.stringify(vehicleRes.data)}`);
    const vehicle = vehicleRes.data;
    console.log(`Vehicle created with ID: ${vehicle._id}`);

    // 3. CREATE DRIVERS (Safety Officer/Manager)
    console.log("\n3. Creating Drivers (Valid driver and Expired driver)...");
    const validExpiry = new Date();
    validExpiry.setFullYear(validExpiry.getFullYear() + 2);

    const expiredExpiry = new Date();
    expiredExpiry.setFullYear(expiredExpiry.getFullYear() - 1);

    // Create valid driver
    const driverRes = await request(`${baseUrl}/api/drivers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${managerToken}` },
      body: {
        name: "Alex",
        licenseNumber: `LIC-${Date.now()}`,
        licenseCategory: "Class B",
        licenseExpiryDate: validExpiry,
        contactNumber: "+91 9999999999",
        safetyScore: 95,
        status: "Available",
      },
    });
    if (driverRes.status !== 201) throw new Error(`Valid driver creation failed: ${JSON.stringify(driverRes.data)}`);
    const driver = driverRes.data;
    console.log(`Valid Driver 'Alex' created with ID: ${driver._id}`);

    // Create expired driver
    const expDriverRes = await request(`${baseUrl}/api/drivers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${managerToken}` },
      body: {
        name: "Expired Dave",
        licenseNumber: `LIC-EXP-${Date.now()}`,
        licenseCategory: "Class C",
        licenseExpiryDate: expiredExpiry,
        contactNumber: "+91 9888888888",
        status: "Available",
      },
    });
    if (expDriverRes.status !== 201) throw new Error("Expired driver creation failed");
    const expiredDriver = expDriverRes.data;
    console.log(`Expired Driver 'Dave' created with ID: ${expiredDriver._id}`);

    // 4. CREATE TRIPS
    console.log("\n4. Creating Trip drafts...");
    // Valid Cargo Trip (450kg)
    const tripRes = await request(`${baseUrl}/api/trips`, {
      method: "POST",
      headers: { Authorization: `Bearer ${dispatcherToken}` },
      body: {
        source: "Depot A",
        destination: "Hub B",
        vehicle: vehicle._id,
        driver: driver._id,
        cargoWeight: 450,
        plannedDistance: 120,
      },
    });
    if (tripRes.status !== 201) throw new Error(`Trip creation failed: ${JSON.stringify(tripRes.data)}`);
    const trip = tripRes.data;
    console.log(`Valid trip draft created with ID: ${trip._id}`);

    // Overweight Trip Draft (600kg)
    const overweightRes = await request(`${baseUrl}/api/trips`, {
      method: "POST",
      headers: { Authorization: `Bearer ${dispatcherToken}` },
      body: {
        source: "Depot A",
        destination: "Hub B",
        vehicle: vehicle._id,
        driver: driver._id,
        cargoWeight: 600, // exceeds 500kg
        plannedDistance: 120,
      },
    });
    const overweightTrip = overweightRes.data;
    console.log(`Overweight trip draft created with ID: ${overweightTrip._id}`);

    // Expired Driver Trip Draft
    const expTripRes = await request(`${baseUrl}/api/trips`, {
      method: "POST",
      headers: { Authorization: `Bearer ${dispatcherToken}` },
      body: {
        source: "Depot A",
        destination: "Hub B",
        vehicle: vehicle._id,
        driver: expiredDriver._id,
        cargoWeight: 400,
        plannedDistance: 120,
      },
    });
    const expiredDriverTrip = expTripRes.data;
    console.log(`Expired driver trip draft created with ID: ${expiredDriverTrip._id}`);

    // 5. TEST DISPATCH BUSINESS VALIDATIONS
    console.log("\n5. Verifying Dispatch Business Validation Rules...");

    // Test 5a: Overweight validation
    console.log("5a. Dispatching overweight trip (Cargo 600kg)...");
    const dispOverweight = await request(`${baseUrl}/api/trips/${overweightTrip._id}/dispatch`, {
      method: "POST",
      headers: { Authorization: `Bearer ${dispatcherToken}` },
    });
    console.log(`Result Status: ${dispOverweight.status} (Expected: 400)`);
    console.log(`Result Message: ${dispOverweight.data.message}`);
    if (dispOverweight.status !== 400) throw new Error("Dispatch validation should have failed for overweight cargo!");

    // Test 5b: Expired license validation
    console.log("5b. Dispatching trip with expired driver license...");
    const dispExpired = await request(`${baseUrl}/api/trips/${expiredDriverTrip._id}/dispatch`, {
      method: "POST",
      headers: { Authorization: `Bearer ${dispatcherToken}` },
    });
    console.log(`Result Status: ${dispExpired.status} (Expected: 400)`);
    console.log(`Result Message: ${dispExpired.data.message}`);
    if (dispExpired.status !== 400) throw new Error("Dispatch validation should have failed for expired license!");

    // Test 5c: Dispatching valid trip
    console.log("5c. Dispatching valid trip...");
    const dispValid = await request(`${baseUrl}/api/trips/${trip._id}/dispatch`, {
      method: "POST",
      headers: { Authorization: `Bearer ${dispatcherToken}` },
    });
    console.log(`Result Status: ${dispValid.status} (Expected: 200)`);
    if (dispValid.status !== 200) throw new Error("Valid dispatch failed!");

    // Check Vehicle & Driver statuses updated to "On Trip"
    const checkVehicle = await request(`${baseUrl}/api/vehicles/${vehicle._id}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const checkDriver = await request(`${baseUrl}/api/drivers/${driver._id}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    console.log(`Vehicle Status: ${checkVehicle.data.status} (Expected: On Trip)`);
    console.log(`Driver Status: ${checkDriver.data.status} (Expected: On Trip)`);
    if (checkVehicle.data.status !== "On Trip" || checkDriver.data.status !== "On Trip") {
      throw new Error("Vehicle/Driver statuses not updated to On Trip!");
    }

    // 6. COMPLETE TRIP
    console.log("\n6. Completing trip and recording odometer, fuel logs, and revenue...");
    const completeRes = await request(`${baseUrl}/api/trips/${trip._id}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${dispatcherToken}` },
      body: {
        finalOdometer: 10120, // +120km
        actualDistance: 120,
        fuelConsumed: 12, // liters
        fuelCost: 1200, // ₹1200
        revenue: 8000, // ₹8000 revenue
      },
    });
    console.log(`Result Status: ${completeRes.status} (Expected: 200)`);
    if (completeRes.status !== 200) throw new Error("Trip completion failed");

    // Verify status restored to Available, odometer updated
    const vehicleAfterTrip = await request(`${baseUrl}/api/vehicles/${vehicle._id}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const driverAfterTrip = await request(`${baseUrl}/api/drivers/${driver._id}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    console.log(`Vehicle Status: ${vehicleAfterTrip.data.status} (Expected: Available)`);
    console.log(`Vehicle Odometer: ${vehicleAfterTrip.data.odometer} (Expected: 10120)`);
    console.log(`Driver Status: ${driverAfterTrip.data.status} (Expected: Available)`);
    if (vehicleAfterTrip.data.status !== "Available" || vehicleAfterTrip.data.odometer !== 10120 || driverAfterTrip.data.status !== "Available") {
      throw new Error("Odometer or Available status not updated properly!");
    }

    // Check Expense generated automatically
    const expensesRes = await request(`${baseUrl}/api/expenses?vehicle=${vehicle._id}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    console.log(`Expenses found for vehicle: ${expensesRes.data.length} (Expected: 1 fuel expense)`);
    console.log(`First Expense Amount: ₹${expensesRes.data[0]?.amount} (Expected: 1200)`);
    if (expensesRes.data.length !== 1 || expensesRes.data[0].amount !== 1200 || expensesRes.data[0].type !== "Fuel") {
      throw new Error("Automatic Fuel Expense was not created correctly!");
    }

    // 7. MAINTENANCE WORKFLOW
    console.log("\n7. Putting vehicle into maintenance (Oil Change, Cost ₹3000)...");
    const maintRes = await request(`${baseUrl}/api/maintenance`, {
      method: "POST",
      headers: { Authorization: `Bearer ${managerToken}` },
      body: {
        vehicleId: vehicle._id,
        description: "Oil Change & Brake Check",
        cost: 3000,
      },
    });
    console.log(`Result Status: ${maintRes.status} (Expected: 201)`);
    if (maintRes.status !== 201) throw new Error("Logging maintenance failed");
    const maintLog = maintRes.data;

    // Verify vehicle status is "In Shop"
    const vehicleInShop = await request(`${baseUrl}/api/vehicles/${vehicle._id}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    console.log(`Vehicle Status: ${vehicleInShop.data.status} (Expected: In Shop)`);
    if (vehicleInShop.data.status !== "In Shop") {
      throw new Error("Vehicle status did not change to In Shop!");
    }

    console.log("Closing maintenance log...");
    const closeMaintRes = await request(`${baseUrl}/api/maintenance/${maintLog._id}/close`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${managerToken}` },
      body: {
        cost: 3500, // actual cost updated
      },
    });
    console.log(`Result Status: ${closeMaintRes.status} (Expected: 200)`);
    if (closeMaintRes.status !== 200) throw new Error("Closing maintenance failed");

    // Verify status restored to Available
    const vehicleAfterMaint = await request(`${baseUrl}/api/vehicles/${vehicle._id}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    console.log(`Vehicle Status: ${vehicleAfterMaint.data.status} (Expected: Available)`);
    if (vehicleAfterMaint.data.status !== "Available") {
      throw new Error("Vehicle status did not return to Available!");
    }

    // Check Expense generated automatically for maintenance
    const allExpenses = await request(`${baseUrl}/api/expenses?vehicle=${vehicle._id}`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    console.log(`Total Expenses found: ${allExpenses.data.length} (Expected: 2 - Fuel + Maintenance)`);
    if (allExpenses.data.length !== 2) throw new Error("Maintenance expense not logged!");

    // 8. DASHBOARD AND REPORT ANALYTICS
    console.log("\n8. Fetching Dashboard KPIs...");
    const dashboardRes = await request(`${baseUrl}/api/dashboard`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    console.log(`Active Trips count: ${dashboardRes.data.activeTrips}`);
    console.log(`Available Vehicles count: ${dashboardRes.data.availableVehicles}`);
    console.log(`Drivers On Duty count: ${dashboardRes.data.driversOnDuty}`);

    console.log("\n9. Fetching Analytics Reports...");
    const analyticsRes = await request(`${baseUrl}/api/reports/analytics`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const vehicleAnalytics = analyticsRes.data.find(r => r.vehicleId === vehicle._id);
    console.log(`Vehicle Name: ${vehicleAnalytics?.vehicleName}`);
    console.log(`Fuel Efficiency: ${vehicleAnalytics?.fuelEfficiency} km/L (Expected: 10.00 km/L)`);
    console.log(`Total Operational Cost: ₹${vehicleAnalytics?.totalOperationalCost} (Expected: 1200 + 3500 = 4700)`);
    console.log(`Revenue Generated: ₹${vehicleAnalytics?.totalRevenue} (Expected: 8000)`);
    console.log(`Vehicle ROI: ${vehicleAnalytics?.roiPercent}% (Expected: (8000 - 4700) / 600000 * 100 = 0.55%)`);

    if (vehicleAnalytics.fuelEfficiency !== 10.00) throw new Error("Fuel efficiency calculation is wrong!");
    if (vehicleAnalytics.totalOperationalCost !== 4700) throw new Error("Operational cost calculation is wrong!");

    console.log("\n10. Fetching CSV Report Export...");
    const csvRes = await request(`${baseUrl}/api/reports/export`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    console.log(`Result Status: ${csvRes.status} (Expected: 200)`);
    console.log("CSV Header Sample:\n", csvRes.data.split("\n")[0]);
    if (csvRes.status !== 200 || !csvRes.data.includes("Registration Number")) {
      throw new Error("CSV Export failed");
    }

    console.log("\n=================== E2E TESTS COMPLETED SUCCESSFULLY! ===================\n");
    process.exit(0);
  } catch (error) {
    console.error("\nTEST FAILURE ERROR:", error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
};

runTests();
