import React from "react";
import { Link } from "react-router-dom";
import "@/components/Navbar/Navbar.css";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          CSSR AI
        </Link>
      </div>
      <div className="navbar-right">
        <span className="navbar-team">IPS Team - IMB - CITZ</span>
      </div>
    </nav>
  );
};

export default Navbar; 
