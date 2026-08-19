const Group = require("../models/Group");
const User = require("../models/User");

const createGroup = async (req, res) => {
  try {
    const { name } = req.body || {};

    if (!name) {
      return res.status(400).json({
        message: "Group name is required",
      });
    }

    const group = await Group.create({
      name,
      ownerId: req.user.userId,
      members: [req.user.userId],
    });

    return res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user.userId,
    })
      .populate("ownerId", "name email")
      .populate("members", "name email");

    return res.status(200).json({
      groups,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("ownerId", "name email")
      .populate("members", "name email");

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (member) =>
        member._id.toString() === req.user.userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not authorised to view this group",
      });
    }

    return res.status(200).json({
      group,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const addMember = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isOwner =
      group.ownerId.toString() === req.user.userId.toString();

    if (!isOwner) {
      return res.status(403).json({
        message: "Only the group owner can add members",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyMember = group.members.some(
      (memberId) =>
        memberId.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({
        message: "User is already a member of this group",
      });
    }

    group.members.push(user._id);

    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate("ownerId", "name email")
      .populate("members", "name email");

    return res.status(200).json({
      message: "Member added successfully",
      group: updatedGroup,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
};