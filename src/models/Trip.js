const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    cargoWeight: {
      type: Number,
      required: true,
    },
    plannedDistance: {
      type: Number,
      required: true,
    },
    actualDistance: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["Draft", "Dispatched", "Completed", "Cancelled"],
      default: "Draft",
    },
    revenue: {
      type: Number,
      default: 0,
    },
    finalOdometer: {
      type: Number,
    },
    fuelConsumed: {
      type: Number,
    },
    dispatchDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);
