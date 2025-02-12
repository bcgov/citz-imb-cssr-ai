import React from "react";
import { Link } from "react-router-dom";
import "@/components/Navbar/Navbar.css";

// Navigation bar component that displays the app title and team information
const Navbar: React.FC = () => {
	return (
		<nav className="navbar">
			{/* Left section with app title/home link */}
			<div className="navbar-left">
				<Link to="/" className="navbar-brand">
					CSSR AI
				</Link>
			</div>
			{/* Right section with team information */}
			<div className="navbar-right">
				<span className="navbar-team">IPS Team - IMB - CITZ</span>
			</div>
		</nav>
	);
};

export default Navbar;
