const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    externalPlaceId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      default: null,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    rating: {
      type: Number,
      default: null,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

placeSchema.index(
  {
    tripId: 1,
    externalPlaceId: 1,
  },
  {
    unique: true,
  }
);

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;