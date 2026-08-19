const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Group = require("../models/Group");

const createTrip = async (req, res) => {
  try {
    const {
      name,
      country,
      city,
      startDate,
      endDate,
    } = req.body || {};

    if (!name || !country || !city || !startDate || !endDate) {
      return res.status(400).json({
        message:
          "Name, country, city, startDate and endDate are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.groupId)) {
      return res.status(400).json({
        message: "Invalid group ID",
      });
    }

    const group = await Group.findById(req.params.groupId);

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
          "You must be a member of this group to create a trip",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    const trip = await Trip.create({
      groupId: group._id,
      name,
      country,
      city,
      startDate,
      endDate,
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getGroupTrips = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.groupId)) {
      return res.status(400).json({
        message: "Invalid group ID",
      });
    }

    const group = await Group.findById(req.params.groupId);

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
          "You are not authorised to view this group's trips",
      });
    }

    const trips = await Trip.find({
      groupId: group._id,
    })
      .populate("createdBy", "name email")
      .sort({ startDate: 1 });

    return res.status(200).json({
      trips,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getTripById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid trip ID",
      });
    }

    const trip = await Trip.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("groupId", "name ownerId members");

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    const isMember = trip.groupId.members.some(
      (memberId) =>
        memberId.toString() === req.user.userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not authorised to view this trip",
      });
    }

    return res.status(200).json({
      trip,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateTrip = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid trip ID",
      });
    }

    const trip = await Trip.findById(req.params.id);

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
        message: "You are not authorised to update this trip",
      });
    }

    const {
      name,
      country,
      city,
      startDate,
      endDate,
      status,
    } = req.body || {};

    const newStartDate = startDate
      ? new Date(startDate)
      : new Date(trip.startDate);

    const newEndDate = endDate
      ? new Date(endDate)
      : new Date(trip.endDate);

    if (newEndDate < newStartDate) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    if (name !== undefined) trip.name = name;
    if (country !== undefined) trip.country = country;
    if (city !== undefined) trip.city = city;
    if (startDate !== undefined) trip.startDate = startDate;
    if (endDate !== undefined) trip.endDate = endDate;
    if (status !== undefined) trip.status = status;

    await trip.save();

    return res.status(200).json({
      message: "Trip updated successfully",
      trip,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteTrip = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid trip ID",
      });
    }

    const trip = await Trip.findById(req.params.id);

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

    const isOwner =
      group.ownerId.toString() === req.user.userId.toString();

    const isCreator =
      trip.createdBy.toString() === req.user.userId.toString();

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        message: "You are not authorised to delete this trip",
      });
    }

    await trip.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createTrip,
  getGroupTrips,
  getTripById,
  updateTrip,
  deleteTrip,
};