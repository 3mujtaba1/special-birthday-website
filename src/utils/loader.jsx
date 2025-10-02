// utils/Loader.jsx
import React from "react";
import { Mirage } from "ldrs/react";
import "ldrs/react/Mirage.css";
import "./loader.css"; // import the CSS we’ll create

const Loader = ({ size = 60, speed = 2.5, color = "black" }) => {
  return (
    <div className="loader-overlay">
      <Mirage size={size} speed={speed} color={color} />
    </div>
  );
};

export default Loader;
