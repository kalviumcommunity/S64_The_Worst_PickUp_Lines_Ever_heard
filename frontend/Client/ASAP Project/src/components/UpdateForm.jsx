import React, { useState } from "react";
import axios from "axios";

const UpdateForm = ({ selectedLine, onClose, onUpdate }) => {
  const [updatedLine, setUpdatedLine] = useState(selectedLine.line);
  const [contributor, setContributor] = useState(selectedLine.contributor);
  const [category, setCategory] = useState(selectedLine.category);
  const [mood, setMood] = useState(selectedLine.mood);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      _id: selectedLine._id,
      line: updatedLine,
      contributor,
      category,
      mood,
    };

    try {
      onUpdate(updatedData); // Calls parent function to update
    } catch (error) {
      console.error("❌ Error updating pick-up line:", error);
    }
  };

  return (
    <div className="update-modal">
      <h2>Edit Pick-Up Line</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={updatedLine} onChange={(e) => setUpdatedLine(e.target.value)} />
        <input type="text" value={contributor} onChange={(e) => setContributor(e.target.value)} />
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input type="text" value={mood} onChange={(e) => setMood(e.target.value)} />
        <button type="submit">Update</button>
        <button onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default UpdateForm;
