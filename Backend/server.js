require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

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
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Access Denied. No Token Provided" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    const token = jwt.sign({ _id: user._id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

    res.cookie("username", user.username, { httpOnly: true, secure: false, sameSite: "Strict" });

    res.json({ message: "Login successful", userId: user._id });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




// Protected Route Example (Only accessible if logged in)
app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Logout Route - Clears the cookie
app.post("/logout", (req, res) => {
  res.clearCookie("username", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.json({ message: "Logged out successfully" });
});



// API: Add a pick-up line (Protected)
app.post("/pickup-lines", verifyToken, async (req, res) => {
  try {
    console.log("Incoming request:", req.body);

    if (!req.body.line) {
      console.log("❌ Missing 'line' field");
      return res.status(400).json({ error: "Line is required" });
    }

    const newLine = new PickUpLine({
      line: req.body.line,
      contributor: req.user.email || "Anonymous",
      category: req.body.category || "General",
      mood: req.body.mood || "Neutral",
    });

    await newLine.save();
    console.log("✅ Pick-up line added:", newLine);

    res.status(201).json(newLine);
  } catch (error) {
    console.error("❌ Error in /pickup-lines:", error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get all pick-up lines (Public) with sorting
app.get("/pickup-lines", async (req, res) => {
  try {
    let sortBy = req.query.sortBy || "date";
    let sortOrder = sortBy === "date" ? -1 : 1;
    
    const lines = await PickUpLine.find().sort({ [sortBy]: sortOrder });
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
      console.log("❌ Invalid ID format:", id);
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const deletedLine = await PickUpLine.findByIdAndDelete(id);
    if (!deletedLine) {
      console.log("❌ Pick-up line not found:", id);
      return res.status(404).json({ error: "Pick-up line not found" });
    }

    console.log("✅ Pick-up line deleted:", deletedLine);
    res.json({ message: "Pick-up line deleted successfully", deletedLine });
  } catch (error) {
    console.error("❌ Error in DELETE /pickup-lines:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
