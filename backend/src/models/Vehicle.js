const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    vehicleName: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["Truck", "Van", "Bus", "Car", "Other"],
    },

    maxLoad: {
      type: Number,
      required: true,
    },

    odometer: {
      type: Number,
      default: 0,
    },

    acquisitionCost: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Available",
        "On Trip",
        "In Shop",
        "Retired",
      ],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);