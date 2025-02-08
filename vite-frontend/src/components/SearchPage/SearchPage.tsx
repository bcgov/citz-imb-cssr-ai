import React from "react";
import { SearchForm } from "@/components/SearchForm/SearchForm";
import "@/components/SearchPage/SearchPage.css";

const SearchPage: React.FC = () => {
	return (
		<div className="search-page">
			<h1>Cloud Security Schedule Review AI</h1>
			<SearchForm />
		</div>
	);
};

export default SearchPage;
