require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Models
const Role = require("./models/Role");
const User = require("./models/user");
const Vehicle = require("./models/Vehicle");
const Driver = require("./models/Driver");
const Trip = require("./models/Trip");
const MaintenanceLog = require("./models/MaintenanceLog");
const FuelLog = require("./models/FuelLog");
const Expense = require("./models/Expense");

const connectDB = require("./config/db");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clean existing data
    await Role.deleteMany();
    await User.deleteMany();
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await Trip.deleteMany();
    await MaintenanceLog.deleteMany();
    await FuelLog.deleteMany();
    await Expense.deleteMany();

    console.log("Database cleared.");

    // 1. Seed Roles
    const roles = await Role.create([
      { name: "Fleet Manager", description: "Oversees fleet assets, maintenance, and analytics" },
      { name: "Dispatcher", description: "Creates trips, assigns vehicles and drivers, and dispatches routes" },
      { name: "Safety Officer", description: "Ensures driver compliance, license validity, and safety scores" },
      { name: "Financial Analyst", description: "Reviews expenses, fuel logs, and fleet ROI" },
    ]);
    console.log(`Seeded ${roles.length} roles.`);

    // 2. Seed Users
    const passwordHash = await bcrypt.hash("password123", 10);
    const users = await User.create([
      {
        name: "Fleet Manager User",
        email: "manager@transitops.com",
        password: passwordHash,
        role: "Fleet Manager",
      },
      {
        name: "Dispatcher User",
        email: "dispatcher@transitops.com",
        password: passwordHash,
        role: "Dispatcher",
      },
      {
        name: "Safety Officer User",
        email: "safety@transitops.com",
        password: passwordHash,
        role: "Safety Officer",
      },
      {
        name: "Financial Analyst User",
        email: "finance@transitops.com",
        password: passwordHash,
        role: "Financial Analyst",
      },
    ]);
    console.log(`Seeded ${users.length} users (Password: 'password123').`);

    // 3. Seed Vehicles
    const vehicles = await Vehicle.create([
      {
        registrationNumber: "GJ01AB4521",
        vehicleName: "Van-05",
        type: "Van",
        maxLoad: 500, // kg
        odometer: 74000,
        acquisitionCost: 620000,
        status: "Available",
      },
      {
        registrationNumber: "GJ01AB9981",
        vehicleName: "TRUCK-11",
        type: "Truck",
        maxLoad: 5000, // kg (5 Ton)
        odometer: 182000,
        acquisitionCost: 2450000,
        status: "Available",
      },
      {
        registrationNumber: "GJ01AB812D",
        vehicleName: "MINI-03",
        type: "Car", // (Representing mini/others)
        maxLoad: 1000, // kg (1 Ton)
        odometer: 66000,
        acquisitionCost: 410000,
        status: "Available",
      },
    ]);
    console.log(`Seeded ${vehicles.length} vehicles.`);

    // 4. Seed Drivers
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2); // Expiry in 2 years (valid)

    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1); // Expiry in past (expired)

    const drivers = await Driver.create([
      {
        name: "Alex",
        licenseNumber: "DL-12345",
        licenseCategory: "Heavy Commercial",
        licenseExpiryDate: futureDate,
        contactNumber: "+91 9876543210",
        safetyScore: 95,
        status: "Available",
      },
      {
        name: "Priya",
        licenseNumber: "DL-67890",
        licenseCategory: "Light Motor Vehicle",
        licenseExpiryDate: futureDate,
        contactNumber: "+91 9988776655",
        safetyScore: 98,
        status: "Available",
      },
      {
        name: "Expired Driver Dave",
        licenseNumber: "DL-EXP-001",
        licenseCategory: "Heavy Commercial",
        licenseExpiryDate: pastDate,
        contactNumber: "+91 9123456789",
        safetyScore: 80,
        status: "Available", // status available but license expired
      },
      {
        name: "Suspended Sam",
        licenseNumber: "DL-SUS-002",
        licenseCategory: "Heavy Commercial",
        licenseExpiryDate: futureDate,
        contactNumber: "+91 9000000000",
        safetyScore: 40,
        status: "Suspended",
      },
    ]);
    console.log(`Seeded ${drivers.length} drivers.`);

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
