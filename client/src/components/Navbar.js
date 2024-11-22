
import React from 'react';
import { Link } from 'react-router-dom';
import logo from './daisy2.png'; 

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Logo" className="navbar-logo" />
        <Link to="/" className="navbar-brand">CSSR AI</Link>
      </div>
      <div className="navbar-right">
        <span className="navbar-team">IPS Team - IMB - CITZ</span>
      </div>
    </nav>
  );
}

export default Navbar;