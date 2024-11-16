// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Import the CSS file for styling

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">MyDocs</div>
      <div className="navbar-links">
        <Link to="/documents">Home</Link>
        <Link to="/login">Log In</Link>
      </div>
    </nav>
  );
};

export default Navbar;
