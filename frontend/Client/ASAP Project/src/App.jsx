import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import PickUpLinePage from "./components/PickUpLine";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pickup-lines" element={<PickUpLinePage />} />
      </Routes>
    </Router>
  );
};

export default App;
