require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema & Model
const pickUpLineSchema = new mongoose.Schema({
  line: { type: String, required: true }, 
  contributor: { type: String, default: "Anonymous" }, 
  category: { type: String, default: "General" }, // New field
  mood: { type: String, default: "Neutral" }, // New field
  date: { type: Date, default: Date.now }
});

const PickUpLine = mongoose.model("PickUpLine", pickUpLineSchema);

// 🔄 Update old records if `category` and `mood` are missing
const updateOldEntries = async () => {
  try {
    const result = await PickUpLine.updateMany(
      { category: { $exists: false } }, 
      { $set: { category: "Unknown", mood: "Unknown" } }
    );
    console.log(`✅ Updated ${result.modifiedCount} old entries.`);
  } catch (error) {
    console.error("❌ Error updating old entries:", error);
  }
};
updateOldEntries(); // Run once on server start

// API: Add a pick-up line
app.post("/pickup-lines", async (req, res) => {
  try {
    console.log("📥 Received:", req.body); // Debug log
    if (!req.body.line) return res.status(400).json({ error: "Line is required" });

    const newLine = await PickUpLine.create({
      line: req.body.line,
      contributor: req.body.contributor || "Anonymous",
      category: req.body.category || "General",
      mood: req.body.mood || "Neutral",
    });

    console.log("✅ Saved:", newLine); // Debug log
    res.status(201).json(newLine);
  } catch (error) {
    console.error("❌ Error saving pick-up line:", error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get all pick-up lines
app.get("/pickup-lines", async (req, res) => {
  try {
    const lines = await PickUpLine.find().sort({ date: -1 });
    console.log("📤 Sending data:", lines); // Debugging log
    res.json(lines);
  } catch (error) {
    console.error("❌ Error fetching pick-up lines:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
