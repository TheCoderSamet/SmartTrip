const mongoose = require("mongoose");

const {
  searchNearbyPlaces,
} = require("../services/placesService");

const Place = require("../models/Place");
const Trip = require("../models/Trip");
const Group = require("../models/Group");

const searchPlaces = async (req, res) => {
  try {
    const { lat, lng, type, radius } = req.query;

    if (!lat || !lng || !type) {
      return res.status(400).json({
        message: "lat, lng and type are required",
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    const searchRadius = radius ? Number(radius) : 3000;

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return res.status(400).json({
        message: "lat and lng must be valid numbers",
      });
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        message: "Invalid latitude or longitude",
      });
    }

    if (
      Number.isNaN(searchRadius) ||
      searchRadius <= 0 ||
      searchRadius > 50000
    ) {
      return res.status(400).json({
        message: "Radius must be between 1 and 50000 metres",
      });
    }

    const places = await searchNearbyPlaces({
      latitude,
      longitude,
      type,
      radius: searchRadius,
    });

    const formattedPlaces = places.map((place) => ({
      googlePlaceId: place.id,
      name: place.displayName?.text || "Unknown",
      address: place.formattedAddress || null,
      rating: place.rating || null,
      latitude: place.location?.latitude || null,
      longitude: place.location?.longitude || null,
      types: place.types || [],
    }));

    return res.status(200).json({
      count: formattedPlaces.length,
      places: formattedPlaces,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to search places",
      error: error.message,
    });
  }
};

const savePlaceToTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        message: "Invalid trip ID",
      });
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    const group = await Group.findById(trip.groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) =>
        memberId.toString() === req.user.userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message:
          "You are not authorised to add places to this trip",
      });
    }

    const {
      googlePlaceId,
      name,
      category,
      address,
      latitude,
      longitude,
      rating,
    } = req.body || {};

    if (
      !googlePlaceId ||
      !name ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message:
          "googlePlaceId, name, latitude and longitude are required",
      });
    }

    const existingPlace = await Place.findOne({
      tripId,
      externalPlaceId: googlePlaceId,
    });

    if (existingPlace) {
      return res.status(409).json({
        message: "Place is already saved to this trip",
      });
    }

    const place = await Place.create({
      tripId,
      externalPlaceId: googlePlaceId,
      name,
      category: category || null,
      address: address || null,
      latitude,
      longitude,
      rating: rating ?? null,
      addedBy: req.user.userId,
    });

    return res.status(201).json({
      message: "Place added to trip successfully",
      place,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Place is already saved to this trip",
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getTripPlaces = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        message: "Invalid trip ID",
      });
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    const group = await Group.findById(trip.groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) =>
        memberId.toString() === req.user.userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message:
          "You are not authorised to view places for this trip",
      });
    }

    const places = await Place.find({
      tripId,
    })
      .populate("addedBy", "name email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      count: places.length,
      places,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteTripPlace = async (req, res) => {
  try {
    const { tripId, placeId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(tripId) ||
      !mongoose.Types.ObjectId.isValid(placeId)
    ) {
      return res.status(400).json({
        message: "Invalid trip ID or place ID",
      });
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    const group = await Group.findById(trip.groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) =>
        memberId.toString() === req.user.userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message:
          "You are not authorised to remove places from this trip",
      });
    }

    const place = await Place.findOne({
      _id: placeId,
      tripId,
    });

    if (!place) {
      return res.status(404).json({
        message: "Place not found in this trip",
      });
    }

    await place.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  searchPlaces,
  savePlaceToTrip,
  getTripPlaces,
  deleteTripPlace,
};