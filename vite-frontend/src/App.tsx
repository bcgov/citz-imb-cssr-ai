import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "@/components/Navbar/Navbar";
import SearchPage from "@/components/SearchPage/SearchPage";
import ResultsPage from "@/components/ResultsPage/ResultsPage";

const App: React.FC = () => {
	return (
		<Router>
				<Navbar />
				<Routes>
					<Route path="/" element={<SearchPage />} />
					<Route path="/results" element={<ResultsPage />} />
				</Routes>
		</Router>
	);
};

export default App;
