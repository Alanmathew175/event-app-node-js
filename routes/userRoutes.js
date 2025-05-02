const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyGoogleToken } = require("../services/authService");

// Middleware to verify Google token
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyGoogleToken(token);

    if (!payload) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Save or update phone number
router.post("/phone", authMiddleware, async (req, res) => {
  try {
    const { phoneNumber, email, refreshToken } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Simple validation for phone number format
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        message:
          "Invalid phone number format. Please use international format (e.g., +1234567890)",
      });
    }

    // Find user or create a new one
    let user = await User.findOne({ email });

    if (user) {
      user.phoneNumber = phoneNumber;
      await user.save();
    } else {
      user = new User({
        email,
        phoneNumber,
        name: req.user.name,
        googleId: req.user.sub,
        refreshToken: refreshToken,
      });
      await user.save();
    }

    res.status(200).json({
      message: "Phone number saved successfully",
      phoneNumber: user.phoneNumber,
    });
  } catch (error) {
    console.error("Save phone number error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
