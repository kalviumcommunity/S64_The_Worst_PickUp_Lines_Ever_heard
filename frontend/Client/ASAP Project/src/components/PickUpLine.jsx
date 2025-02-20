import React from "react";
import "./PickUpLine.css"; // Import external CSS
import { motion } from "framer-motion"; // Adding animations

const PickUpLine = ({ line, contributor = "Anonymous", date }) => {
  return (
    <motion.div
      className="pickup-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <p className="pickup-text">"{line}"</p>
      <div className="pickup-footer">
        <p className="pickup-contributor">- {contributor}</p>
        <p className="pickup-date">{new Date(date).toLocaleDateString()}</p>
      </div>
      <div className="pickup-icon">💬</div>
    </motion.div>
  );
};

const PickUpLinePage = () => {
  return (
    <div className="pickup-page">
      <motion.h1
        className="pickup-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Worst Pick-Up Lines Ever Heard! 🤦‍♂️
      </motion.h1>

      <PickUpLine 
        line="Are you French? Because Eiffel for you." 
        contributor="John Doe" 
        date="2025-02-19" 
      />
      <PickUpLine 
        line="Is your name Google? Because you have everything I’ve been searching for." 
        contributor="Jane Smith" 
        date="2025-02-18" 
      />
    </div>
  );
};

export default PickUpLinePage;
