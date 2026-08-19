const mongoose = require("mongoose");

const Route = require("../models/Route");
const Trip = require("../models/Trip");
const Group = require("../models/Group");
const Place = require("../models/Place");

const {
  computeGoogleRoute,
} = require("../services/routesService");

const {
  publishRouteJob,
} = require("../services/queueService");


const createRoute = async (req, res) => {
  try {
    const { tripId } = req.params;

    const {
      name,
      placeIds,
      routeType,
    } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        message: "Invalid trip ID",
      });
    }

    if (!name) {
      return res.status(400).json({
        message: "Route name is required",
      });
    }

    if (!Array.isArray(placeIds) || placeIds.length < 2) {
      return res.status(400).json({
        message: "At least two places are required to create a route",
      });
    }

    const invalidPlaceId = placeIds.some(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidPlaceId) {
      return res.status(400).json({
        message: "One or more place IDs are invalid",
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
        message: "You are not authorised to create routes for this trip",
      });
    }

    const places = await Place.find({
      _id: {
        $in: placeIds,
      },
      tripId,
    });

    if (places.length !== placeIds.length) {
      return res.status(400).json({
        message: "All places must belong to this trip",
      });
    }

    const route = await Route.create({
      tripId,
      name,
      places: placeIds,
      routeType: routeType || "walking",
      createdBy: req.user.userId,
      status: "draft",
    });

    const populatedRoute = await Route.findById(route._id)
      .populate(
        "places",
        "name category address latitude longitude rating"
      )
      .populate(
        "createdBy",
        "name email"
      );

    return res.status(201).json({
      message: "Route created successfully",
      route: populatedRoute,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


const getTripRoutes = async (req, res) => {
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
        message: "You are not authorised to view routes for this trip",
      });
    }

    const routes = await Route.find({
      tripId,
    })
      .populate(
        "places",
        "name category address latitude longitude rating"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      count: routes.length,
      routes,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


const getRouteById = async (req, res) => {
  try {
    const { routeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({
        message: "Invalid route ID",
      });
    }

    const route = await Route.findById(routeId)
      .populate(
        "places",
        "name category address latitude longitude rating"
      )
      .populate(
        "createdBy",
        "name email"
      );

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    const trip = await Trip.findById(route.tripId);

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
        message: "You are not authorised to view this route",
      });
    }

    return res.status(200).json({
      route,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


const calculateRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({
        message: "Invalid route ID",
      });
    }

    const route = await Route.findById(routeId)
      .populate("places");

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    const trip = await Trip.findById(route.tripId);

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
        message: "You are not authorised to calculate this route",
      });
    }

    if (!route.places || route.places.length < 2) {
      return res.status(400).json({
        message: "Route requires at least two places",
      });
    }

    const origin = route.places[0];

    const destination =
      route.places[route.places.length - 1];

    const intermediates =
      route.places.slice(1, -1);

    const travelModeMap = {
      walking: "WALK",
      driving: "DRIVE",
      bicycling: "BICYCLE",
    };

    const googleRoute = await computeGoogleRoute({
      origin,
      destination,
      intermediates,
      travelMode:
        travelModeMap[route.routeType] || "WALK",
    });

    const durationString =
      googleRoute.duration || "0s";

    const durationSeconds = Number(
      durationString.replace("s", "")
    );

    route.distanceMeters =
      googleRoute.distanceMeters ?? null;

    route.durationSeconds =
      Number.isNaN(durationSeconds)
        ? null
        : durationSeconds;

    route.encodedPolyline =
      googleRoute.polyline?.encodedPolyline || null;

    route.status = "ready";

    await route.save();

    return res.status(200).json({
      message: "Route calculated successfully",
      route,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Route calculation failed",
      error: error.message,
    });
  }
};


const calculateRouteAsync = async (req, res) => {
  try {
    const { routeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({
        message: "Invalid route ID",
      });
    }

    const route = await Route.findById(routeId);

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    const trip = await Trip.findById(route.tripId);

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
        message: "You are not authorised to calculate this route",
      });
    }

    route.status = "processing";

    await route.save();

    await publishRouteJob({
      routeId: route._id.toString(),
    });

    return res.status(202).json({
      message: "Route calculation accepted",
      routeId: route._id,
      status: route.status,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to queue route calculation",
      error: error.message,
    });
  }
};


module.exports = {
  createRoute,
  getTripRoutes,
  getRouteById,
  calculateRoute,
  calculateRouteAsync,
};