import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PickUpLine.css";
import { motion } from "framer-motion";

const PickUpLine = ({ lineData, onDelete, onUpdate, authToken }) => {
  const { _id, line, contributor, category, mood, date } = lineData;
  const [isEditing, setIsEditing] = useState(false);
  const [updatedLine, setUpdatedLine] = useState(line);
  const [updatedContributor, setUpdatedContributor] = useState(contributor);
  const [updatedCategory, setUpdatedCategory] = useState(category);
  const [updatedMood, setUpdatedMood] = useState(mood);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:3000/pickup-lines/${_id}`,
        {
          line: updatedLine,
          contributor: updatedContributor,
          category: updatedCategory,
          mood: updatedMood,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      onUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating pick-up line:", error);
    }
  };

  return (
    <motion.div
      className="pickup-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {isEditing ? (
        <form className="pickup-form" onSubmit={handleUpdate}>
          <input type="text" value={updatedLine} onChange={(e) => setUpdatedLine(e.target.value)} placeholder="Edit your pick-up line" />
          <input type="text" value={updatedContributor} onChange={(e) => setUpdatedContributor(e.target.value)} placeholder="Your name" />
          <input type="text" value={updatedCategory} onChange={(e) => setUpdatedCategory(e.target.value)} placeholder="Category" />
          <input type="text" value={updatedMood} onChange={(e) => setUpdatedMood(e.target.value)} placeholder="Mood" />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <p className="pickup-text">"{line}"</p>
          <div className="pickup-footer">
            <p className="pickup-contributor">- {contributor || "Anonymous"}</p>
            <p className="pickup-category">Category: {category || "N/A"}</p>
            <p className="pickup-mood">Mood: {mood || "N/A"}</p>
            <p className="pickup-date">Date: {new Date(date).toLocaleDateString()}</p>
          </div>
          <div className="pickup-actions">
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => onDelete(_id)}>Delete</button>
          </div>
        </>
      )}
    </motion.div>
  );
};

const PickUpLinePage = ({ authToken }) => {
  const [lines, setLines] = useState([]);
  const [newLine, setNewLine] = useState("");
  const [contributor, setContributor] = useState("");
  const [category, setCategory] = useState("");
  const [mood, setMood] = useState("");
  const [sortOption, setSortOption] = useState("-date"); // Default: newest first

  useEffect(() => {
    axios
      .get("http://localhost:3000/pickup-lines", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => setLines(response.data))
      .catch((error) => console.error("Error fetching pickup lines:", error));
  }, [authToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLine.trim()) return alert("Please enter a pick-up line!");
    try {
      const response = await axios.post(
        "http://localhost:3000/pickup-lines",
        {
          line: newLine,
          contributor: contributor || "Anonymous",
          category,
          mood,
          date: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setLines([response.data, ...lines]);
      setNewLine("");
      setContributor("");
      setCategory("");
      setMood("");
    } catch (error) {
      console.error("Error submitting pick-up line:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/pickup-lines/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setLines(lines.filter((line) => line._id !== id));
    } catch (error) {
      console.error("Error deleting pick-up line:", error);
    }
  };

  const handleUpdate = (updatedLine) => {
    setLines(lines.map((line) => (line._id === updatedLine._id ? updatedLine : line)));
  };

  const sortedLines = [...lines].sort((a, b) => {
    if (sortOption === "date") return new Date(a.date) - new Date(b.date);
    if (sortOption === "-date") return new Date(b.date) - new Date(a.date);
    if (sortOption === "contributor") return a.contributor.localeCompare(b.contributor);
    if (sortOption === "category") return a.category.localeCompare(b.category);
    return 0;
  });

  return (
    <div className="pickup-page">
      <motion.h1 className="pickup-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        Worst Pick-Up Lines Ever Heard! 🤦‍♂️
      </motion.h1>

      <select className="pickup-sort-dropdown" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
        <option value="-date">Newest First</option>
        <option value="date">Oldest First</option>
        <option value="contributor">Contributor (A-Z)</option>
        <option value="category">Category (A-Z)</option>
      </select>

      <form className="pickup-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Enter a cringy pick-up line..." value={newLine} onChange={(e) => setNewLine(e.target.value)} />
        <input type="text" placeholder="Your name (optional)" value={contributor} onChange={(e) => setContributor(e.target.value)} />
        <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input type="text" placeholder="Mood" value={mood} onChange={(e) => setMood(e.target.value)} />
        <button type="submit">Submit</button>
      </form>

      {sortedLines.length > 0 ? (
        sortedLines.map((line) => (
          <PickUpLine key={line._id} lineData={line} onDelete={handleDelete} onUpdate={handleUpdate} authToken={authToken} />
        ))
      ) : (
        <p>No pick-up lines yet. Be the first to add one!</p>
      )}
    </div>
  );
};

export default PickUpLinePage;
