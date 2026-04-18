const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const config = require("../config/env");

const router = express.Router();

const createToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, {
    expiresIn: "7d",
  });

router.post(
  "/signup",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must have at least 2 characters"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must have at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const user = await User.create({ name, email, password });
      const token = createToken(user);

      return res.status(201).json({
        message: "Signup successful",
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (_error) {
      return res.status(500).json({ message: "Signup failed" });
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = createToken(user);
      return res.json({
        message: "Login successful",
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (_error) {
      return res.status(500).json({ message: "Login failed" });
    }
  }
);

module.exports = router;
