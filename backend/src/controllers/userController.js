const User = require("../models/User");

const getMe = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getMe,
};