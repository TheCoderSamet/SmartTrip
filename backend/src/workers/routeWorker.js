require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");

const Route = require("../models/Route");

const {
  getChannel,
  connectQueue,
} = require("../services/queueService");

const {
  computeGoogleRoute,
} = require("../services/routesService");


const processRouteJob = async (message) => {
  const channel = getChannel();

  if (!message) {
    return;
  }

  try {
    const data = JSON.parse(
      message.content.toString()
    );

    const { routeId } = data;

    console.log(
      `Processing route job: ${routeId}`
    );

    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      console.error(
        `Invalid route ID: ${routeId}`
      );

      channel.ack(message);
      return;
    }

    const route = await Route.findById(routeId)
      .populate("places");

    if (!route) {
      console.error(
        `Route not found: ${routeId}`
      );

      channel.ack(message);
      return;
    }

    if (!route.places || route.places.length < 2) {
      route.status = "failed";
      await route.save();

      console.error(
        "Route requires at least two places"
      );

      channel.ack(message);
      return;
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

    const googleRoute =
      await computeGoogleRoute({
        origin,
        destination,
        intermediates,
        travelMode:
          travelModeMap[route.routeType] ||
          "WALK",
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
      googleRoute.polyline?.encodedPolyline ||
      null;

    route.status = "ready";

    await route.save();

    console.log(
      `Route completed: ${routeId}`
    );

    channel.ack(message);

  } catch (error) {
    console.error(
      "Route worker error:",
      error.message
    );

    try {
      const data = JSON.parse(
        message.content.toString()
      );

      if (
        data.routeId &&
        mongoose.Types.ObjectId.isValid(
          data.routeId
        )
      ) {
        await Route.findByIdAndUpdate(
          data.routeId,
          {
            status: "failed",
          }
        );
      }
    } catch (updateError) {
      console.error(
        "Failed to mark route as failed:",
        updateError.message
      );
    }

    channel.ack(message);
  }
};


const startWorker = async () => {
  try {
    await connectDB();

    await connectQueue();

    const channel = getChannel();

    if (!channel) {
      throw new Error(
        "RabbitMQ channel is not available"
      );
    }

    console.log(
      "Route worker is waiting for jobs..."
    );

    await channel.consume(
      "route.generate",
      processRouteJob,
      {
        noAck: false,
      }
    );

  } catch (error) {
    console.error(
      "Route worker failed:",
      error.message
    );

    process.exit(1);
  }
};


startWorker();