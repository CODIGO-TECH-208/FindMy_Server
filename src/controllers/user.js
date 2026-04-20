import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({
      message: "Profile retrieved successfully.",
      user
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    if (req.file) {
      // req.file.path contains the cloudinary URL
      user.profilePicture = req.file.path;
    }

    await user.save();

    // Prevent passing the password back
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: userObj
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Get notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    // Mark unread notifications as read
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      message: "Notifications retrieved.",
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
