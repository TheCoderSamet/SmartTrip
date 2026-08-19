const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    places: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Place",
        required: true,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "ready", "processing", "failed"],
      default: "draft",
    },

    routeType: {
      type: String,
      enum: ["walking", "driving", "bicycling"],
      default: "walking",
    },

    distanceMeters: {
      type: Number,
      default: null,
    },

    durationSeconds: {
      type: Number,
      default: null,
    },

    encodedPolyline: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Route = mongoose.model("Route", routeSchema);

module.exports = Route;