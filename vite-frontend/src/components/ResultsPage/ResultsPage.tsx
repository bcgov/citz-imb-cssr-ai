import React, { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LocationState, LinkOptions } from "@/components/ResultsPage/types";
import "@/components/ResultsPage/ResultsPage.css";

// Helper function to clean text from JSON artifacts and improve formatting
const cleanText = (text: string): string => {
	return text
		.replace(/[{}"]/g, "")
		.replace(/\\n/g, "\n")
		.replace(/,(?=[^\s])/g, ", ")
		.trim();
};

// Helper function to format object values, handling nested objects and special information fields
const formatObjectValue = (value: unknown): string => {
	if (typeof value === "object" && value !== null) {
		if ("information" in value || "Information" in value) {
			return String(
				(value as { information?: string; Information?: string }).information ||
					(value as { information?: string; Information?: string }).Information
			);
		}
		return Object.entries(value)
			.map(([k, v]) => `${k}: ${formatObjectValue(v)}`)
			.join("\n");
	}
	return String(value);
};

// Main ResultsPage component to display search results and provide PDF download
export const ResultsPage: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { query, results, sources } = (location.state as LocationState) || {};

	// Render function to handle different types of values and format URLs as clickable links
	const renderValue = (value: unknown): ReactNode => {
		if (typeof value === "object" && value !== null) {
			return (
				<ul className="result-list">
					{Object.entries(value).map(([subKey, subValue]) => (
						<li key={subKey}>
							<strong>{subKey}:</strong> {renderValue(subValue)}
						</li>
					))}
				</ul>
			);
		}

		const formattedValue = cleanText(String(value));
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		const matches = formattedValue.match(urlRegex);

		// Convert URLs in text to clickable links
		if (matches) {
			return (
				<p>
					{formattedValue.split(urlRegex).map((part, index) => {
						if (matches.includes(part)) {
							return (
								<a
									key={index}
									href={part}
									target="_blank"
									rel="noopener noreferrer"
									className="source-link"
								>
									{part}
								</a>
							);
						}
						return <span key={index}>{part}</span>;
					})}
				</p>
			);
		}

		return <p>{formattedValue}</p>;
	};

	// Render the main results section with query information and sources
	const renderResults = (): ReactNode => {
		if (!results?.length) {
			return <p className="no-results">No results found</p>;
		}

		const resultItem = results[0];

		return (
			<div className="results-container">
				<h2>SaaS Solution: {query}</h2>
				{Object.entries(resultItem).map(([key, value]) => (
					<div key={key} className="result-item">
						<strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
						{renderValue(value)}
					</div>
				))}

				{/* Display sources if available */}
				{sources?.length > 0 && (
					<div className="sources-section">
						<h3>Sources:</h3>
						{sources.map((source, index) => (
							<p key={index} className="source-link">
								-{" "}
								<a href={source} target="_blank" rel="noopener noreferrer">
									{source}
								</a>
							</p>
						))}
					</div>
				)}
			</div>
		);
	};

	// Generate PDF report from the search results
	const generatePDF = (data: Record<string, unknown>): void => {
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.width;
		const margin = 20;
		const contentWidth = pageWidth - 2 * margin;

		// Helper function to handle page breaks in PDF
		const checkAndAddPage = (
			currentY: number,
			requiredSpace: number
		): number => {
			if (currentY + requiredSpace > doc.internal.pageSize.height - margin) {
				doc.addPage();
				return margin + 10;
			}
			return currentY;
		};

		// Add title to PDF
		doc.setFontSize(20);
		doc.setTextColor(0, 102, 204);
		doc.setFont("helvetica", "bold");
		let yPos = 20;
		doc.text(`SaaS Solution: ${query}`, margin, yPos);
		yPos += 15;

		// Add content sections to PDF
		Object.entries(data).forEach(([key, value]) => {
			if (value) {
				yPos = checkAndAddPage(yPos, 20);

				// Section header formatting
				doc.setFont("helvetica", "bold");
				doc.setFontSize(12);
				doc.setTextColor(0, 0, 0);
				doc.text(
					`${key.charAt(0).toUpperCase() + key.slice(1)}:`,
					margin,
					yPos
				);
				yPos += 10;

				// Section content formatting
				doc.setFont("helvetica", "normal");
				doc.setFontSize(10);

				const formattedText = cleanText(formatObjectValue(value));
				const lines = doc.splitTextToSize(formattedText, contentWidth);

				yPos = checkAndAddPage(yPos, lines.length * 5);
				doc.text(lines, margin, yPos);
				yPos += lines.length * 5 + 10;
			}
		});

		// Add sources to PDF if available
		if (sources?.length) {
			yPos = checkAndAddPage(yPos, 20 + sources.length * 10);

			doc.setFont("helvetica", "bold");
			doc.setFontSize(12);
			doc.text("Sources:", margin, yPos);
			yPos += 10;

			doc.setFont("helvetica", "normal");
			doc.setTextColor(0, 0, 255);

			sources.forEach((source) => {
				yPos = checkAndAddPage(yPos, 10);
				doc.textWithLink(source, margin, yPos, { url: source } as LinkOptions);
				yPos += 7;
			});
		}

		// Save the PDF with a sanitized filename
		doc.save(`${query.replace(/[^a-zA-Z0-9]/g, "_")}_report.pdf`);
	};

	return (
		<div className="results-page">
			<h1>Results for: {query}</h1>
			{/* Navigation and action buttons */}
			<div className="d-flex justify-content-center mb-3">
				<button className="btn btn-light me-2" onClick={() => navigate("/")}>
					Back to Home
				</button>
				<button
					className="btn btn-primary me-2"
					onClick={() => results?.[0] && generatePDF(results[0])}
					disabled={!results?.length}
				>
					Download PDF
				</button>
			</div>
			{/* Main results display */}
			<div>{renderResults()}</div>
		</div>
	);
};

export default ResultsPage;
