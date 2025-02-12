import React, {
	useState,
	ChangeEvent,
	FormEvent,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
	Categories,
	SearchResponse,
	categoryLabels,
} from "@/components/SearchForm/types";
import { useDebounce } from "@/hooks/useDebounce";
import "@/components/SearchForm/SearchForm.css";

// Main search form component, memoized to prevent unnecessary re-renders
export const SearchForm: React.FC = React.memo(() => {
	// State for form inputs and UI state
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

	// Debounce search query to prevent excessive updates
	const debouncedQuery = useDebounce(query, 300);
	// Delay before showing "Almost there..." message during loading
	const LOADING_DELAY = 12000;

	// Effect to handle loading state messages
	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (loading) {
			setLoadingMessage("Waiting for review...");
			timeout = setTimeout(() => {
				setLoadingMessage("Almost there...");
			}, LOADING_DELAY);
		}
		return () => {
			if (timeout) {
				clearTimeout(timeout);
			}
		};
	}, [loading]);

	// Validate form inputs before submission
	const validateForm = useCallback((): boolean => {
		if (!debouncedQuery.trim()) {
			setError("Please enter a SaaS solution name");
			return false;
		}

		const hasSelectedCategory = Object.entries(categories).some(
			([key, value]) => key !== "selectAll" && value
		);

		if (!hasSelectedCategory) {
			setError("Please select at least one CSSR section");
			return false;
		}

		return true;
	}, [debouncedQuery, categories]);

	// Handle category checkbox changes
	const handleCategoryChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { name, checked } = e.target;
			setError(null);

			if (name === "selectAll") {
				// Update all categories when "Select All" is toggled
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
				// Update individual category
				setCategories((prev) => ({
					...prev,
					[name]: checked,
					selectAll: false,
				}));
			}
		},
		[]
	);

	// Handle form submission and API call
	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// Make API request to search endpoint
			const response = await fetch("/api/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query: debouncedQuery, categories }),
			});

			if (!response.ok) {
				throw new Error(
					`Network response was not ok: ${response.status} ${response.statusText}`
				);
			}

			// Process response and navigate to results page
			const data: SearchResponse = await response.json();
			if (data?.results?.length) {
				navigate("/results", {
					state: {
						query: debouncedQuery,
						results: data.results,
						sources: data.sources,
					},
				});
			} else {
				setError("No results found for your search");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "An error occurred while processing your request";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Memoize category options to prevent unnecessary re-renders
	const categoryOptions = useMemo(
		() =>
			Object.keys(categories).map((category) => (
				<label key={category} className="category-option">
					<input
						type="checkbox"
						name={category}
						checked={categories[category as keyof Categories]}
						onChange={handleCategoryChange}
						aria-label={categoryLabels[category] || category}
					/>
					<span>{categoryLabels[category] || category}</span>
				</label>
			)),
		[categories, handleCategoryChange]
	);

	return (
		// Main form container with accessibility attributes
		<div role="main">
			<form onSubmit={handleSubmit} className="search-form" noValidate>
				{/* SaaS solution input field */}
				<div className="form-group">
					<label htmlFor="saas-solution">Enter the SaaS Solution Name:</label>
					<input
						id="saas-solution"
						type="text"
						value={query}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setQuery(e.target.value)
						}
						placeholder="e.g. Salesforce"
						required
						aria-required="true"
						aria-invalid={error !== null}
						aria-describedby={error ? "error-message" : undefined}
					/>
				</div>
				{/* CSSR sections selection */}
				<div className="form-group">
					<fieldset>
						<legend>Please select one or more CSSR Sections:</legend>
						<div className="section-selection" role="group">
							{categoryOptions}
						</div>
					</fieldset>
				</div>

				{/* Error message display */}
				{error && (
					<div id="error-message" className="error-message" role="alert">
						{error}
					</div>
				)}

				{/* Submit button */}
				<button
					type="submit"
					disabled={loading}
					className="btn btn-primary"
					aria-busy={loading}
				>
					{loading ? "Searching..." : "Search"}
				</button>
			</form>

			{/* Loading spinner and message */}
			{loading && (
				<div className="spinner-container" role="status" aria-live="polite">
					<span className="loader"></span>
					<p className="loading-message">{loadingMessage}</p>
				</div>
			)}
		</div>
	);
});

export default SearchForm;
