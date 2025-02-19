import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import for navigation
import "./LandingPage.css"; // Import external CSS

const LandingPage = () => {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div className="landing-container">
      <div className="content-wrapper">
        {/* Hero Section */}
        <motion.div
          className="hero-section"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Worst Pick-Up Lines Ever Heard! 🤦‍♂️</h1>
          <p>
            A place where you can cringe, laugh, and contribute the most ridiculous pick-up lines you've ever heard!  
            Share your worst finds and see if others can top them.
          </p>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="features-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <FeatureCard
            icon="😂"
            title="Laugh Out Loud"
            description="Read and enjoy the most cringeworthy pick-up lines ever heard."
          />
          <FeatureCard
            icon="📝"
            title="Contribute"
            description="Add your own ridiculous pick-up lines to the collection."
          />
          <FeatureCard
            icon="🔥"
            title="Vote & React"
            description="Like, dislike, and rate the worst pick-up lines."
          />
        </motion.div>

        {/* Call-to-Action Button */}
        <motion.button
          className="cta-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/pickup-lines")} // Navigate to Pick-Up Line Page
        >
          Get Started 🚀
        </motion.button>
      </div>

      {/* Footer */}
      <motion.p
        className="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.7 }}
      >
        Made with ❤️ by Cringe Enthusiasts
      </motion.p>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      className="feature-card"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
};

export default LandingPage;
