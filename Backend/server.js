require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// User Schema & Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// Pick-Up Line Schema & Model
const pickUpLineSchema = new mongoose.Schema({
  line: { type: String, required: true },
  contributor: { type: String, default: "Anonymous" },
  category: { type: String, default: "General" },
  mood: { type: String, default: "Neutral" },
  date: { type: Date, default: Date.now }
});

const PickUpLine = mongoose.model("PickUpLine", pickUpLineSchema);

// Middleware for authentication
const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Get token from cookies
  if (!token) {
    return res.status(401).json({ error: "Access Denied. No Token Provided" });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified; // Store the decoded user info in req.user
    next();
  } catch (error) {
    return res.status(400).json({ error: "Invalid Token" });
  }
};

// User Registration
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save User
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in /register:", error);
    res.status(500).json({ error: error.message });
  }
});

// User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ _id: user._id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

    // Store JWT in a cookie
    res.cookie("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Lax",
    });

    res.json({ message: "Login successful", userId: user._id });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Protected Route (Requires authentication)
app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Logout Route - Clears the JWT cookie
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });

  res.json({ message: "Logged out successfully" });
});

// API: Add a pick-up line (Protected)
app.post("/pickup-lines", verifyToken, async (req, res) => {
  try {
    if (!req.body.line) {
      return res.status(400).json({ error: "Line is required" });
    }

    const newLine = new PickUpLine({
      line: req.body.line,
      contributor: req.user.email || "Anonymous",
      category: req.body.category || "General",
      mood: req.body.mood || "Neutral",
    });

    await newLine.save();
    res.status(201).json(newLine);
  } catch (error) {
    console.error("❌ Error in /pickup-lines:", error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get all pick-up lines (Public) with sorting and pagination
app.get("/pickup-lines", async (req, res) => {
  try {
    const allowedSortFields = ["date", "contributor", "mood"];
    const sortBy = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : "date";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const lines = await PickUpLine.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.json(lines);
  } catch (error) {
    console.error("❌ Error in GET /pickup-lines:", error);
    res.status(500).json({ error: error.message });
  }
});

// API: Delete a pick-up line (Protected)
app.delete("/pickup-lines/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const deletedLine = await PickUpLine.findByIdAndDelete(id);
    if (!deletedLine) {
      return res.status(404).json({ error: "Pick-up line not found" });
    }

    res.json({ message: "Pick-up line deleted successfully", deletedLine });
  } catch (error) {
    console.error("❌ Error in DELETE /pickup-lines:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
