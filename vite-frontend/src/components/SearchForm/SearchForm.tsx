import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Categories,
	SearchResponse,
	categoryLabels,
} from "@/components/SearchForm/types";
import "@/components/SearchForm/SearchForm.css";

export const SearchForm: React.FC = () => {
	const [query, setQuery] = useState<string>("");
	const [categories, setCategories] = useState<Categories>({
		description: false,
		applicability: false,
		compliance_and_certifications: false,
		access_control: false,
		authentication: false,
		security_awareness: false,
		log_generation: false,
		investigations_support: false,
		development_and_vulnerability: false,
		business_continuity: false,
		incident_response: false,
		breach_notifications: false,
		selectAll: false,
	});
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingMessage, setLoadingMessage] = useState<string>(
		"Waiting for review..."
	);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (loading) {
			setLoadingMessage("Waiting for review...");
			timeout = setTimeout(() => {
				setLoadingMessage("Almost there...");
			}, 12000);
		}
		return () => {
			if (timeout) {
				clearTimeout(timeout);
			}
		};
	}, [loading]);

	const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		setError(null); // Clear any previous errors

		if (name === "selectAll") {
			setCategories((prev) =>
				Object.keys(prev).reduce(
					(acc, key) => ({
						...acc,
						[key]: checked,
					}),
					{} as Categories
				)
			);
		} else {
			setCategories((prev) => ({
				...prev,
				[name]: checked,
				selectAll: false,
			}));
		}
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Validate that at least one category is selected
		const hasSelectedCategory = Object.entries(categories).some(
			([key, value]) => key !== "selectAll" && value
		);

		if (!hasSelectedCategory) {
			setError("Please select at least one CSSR section");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query, categories }),
			});

			if (!response.ok) {
				throw new Error(
					`Network response was not ok: ${response.status} ${response.statusText}`
				);
			}

			const data: SearchResponse = await response.json();
			if (data && data.results) {
				navigate("/results", {
					state: { query, results: data.results, sources: data.sources },
				});
			} else {
				setError("No results found for your search");
			}
		} catch (error) {
			console.error("Error fetching data:", error);
			setError(
				error instanceof Error
					? error.message
					: "An error occurred while processing your request"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<form onSubmit={handleSubmit} className="search-form">
				<div className="form-group">
					<label>Enter the SaaS Solution Name:</label>
					<input
						type="text"
						value={query}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setQuery(e.target.value)
						}
						placeholder="e.g. Salesforce"
						required
					/>
				</div>
				<div className="form-group">
					<label>Please select one or more CSSR Sections:</label>
					<div className="section-selection">
						{Object.keys(categories).map((category) => (
							<label key={category}>
								<input
									type="checkbox"
									name={category}
									checked={categories[category as keyof Categories]}
									onChange={handleCategoryChange}
								/>
								{categoryLabels[category] || category}
							</label>
						))}
					</div>
				</div>

				{error && <div className="error-message">{error}</div>}

				<button type="submit" disabled={loading} className="btn btn-primary">
					{loading ? "Searching..." : "Search"}
				</button>
			</form>

			{loading && (
				<div className="spinner-container">
					<span className="loader"></span>
					<p style={{ marginTop: "10px", textAlign: "center" }}>
						{loadingMessage}
					</p>
				</div>
			)}
		</div>
	);
};

export default SearchForm;
