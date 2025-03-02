import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PickUpLine.css";
import { motion } from "framer-motion";

const PickUpLine = ({ line, contributor, category, mood, date }) => (
  <motion.div
    className="pickup-container"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <p className="pickup-text">"{line}"</p>
    <div className="pickup-footer">
      <p className="pickup-contributor">- {contributor || "Anonymous"}</p>
      <p className="pickup-category">Category: {category || "General"}</p>
      <p className="pickup-mood">Mood: {mood || "Neutral"}</p>
      <p className="pickup-date">{new Date(date).toLocaleDateString()}</p>
    </div>
    <div className="pickup-icon">💬</div>
  </motion.div>
);

const PickUpLinePage = () => {
  const [lines, setLines] = useState([]); // Stores pick-up lines
  const [newLine, setNewLine] = useState(""); // User input
  const [contributor, setContributor] = useState(""); // Contributor name
  const [category, setCategory] = useState(""); // Category input
  const [mood, setMood] = useState(""); // Mood input

  // Fetch existing pick-up lines from backend
  useEffect(() => {
    axios.get("http://localhost:3000/pickup-lines")
      .then((response) => {
        console.log("📥 Data received:", response.data); // Debugging
        setLines(response.data);
      })
      .catch((error) => console.error("❌ Error fetching pickup lines:", error));
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLine.trim()) return alert("Please enter a pick-up line!");

    try {
      const response = await axios.post("http://localhost:3000/pickup-lines", {
        line: newLine,
        contributor: contributor || "Anonymous",
        category: category || "General",
        mood: mood || "Neutral",
      });

      console.log("✅ New Entry:", response.data); // Debugging
      setLines([response.data, ...lines]); // Add new line at the top
      setNewLine(""); // Clear input
      setContributor(""); // Clear contributor field
      setCategory(""); // Clear category field
      setMood(""); // Clear mood field
    } catch (error) {
      console.error("❌ Error submitting pick-up line:", error);
    }
  };

  return (
    <div className="pickup-page">
      <motion.h1 className="pickup-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        Worst Pick-Up Lines Ever Heard! 🤦‍♂️
      </motion.h1>

      {/* Form for submitting new pick-up line */}
      <form className="pickup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter a cringy pick-up line..."
          value={newLine}
          onChange={(e) => setNewLine(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your name (optional)"
          value={contributor}
          onChange={(e) => setContributor(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category (e.g., Flirty, Cheesy)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mood (e.g., Funny, Awkward)"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>

      {/* Display all pick-up lines */}
      {lines.length > 0 ? (
        lines.map((line) => <PickUpLine key={line._id} {...line} />)
      ) : (
        <p>No pick-up lines yet. Be the first to add one!</p>
      )}
    </div>
  );
};

export default PickUpLinePage;
