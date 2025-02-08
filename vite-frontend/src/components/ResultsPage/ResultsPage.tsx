import React, { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LocationState, TextOptions, LinkOptions } from "@/components/ResultsPage/types";
import "@/components/ResultsPage/ResultsPage.css";

export const ResultsPage: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { query, results, sources } = (location.state as LocationState) || {};

	const renderValue = (value: unknown): ReactNode => {
		if (typeof value === "object" && value !== null) {
			return (
				<ul>
					{Object.entries(value).map(([subKey, subValue]) => (
						<li key={subKey}>
							<strong>{subKey}:</strong> {renderValue(subValue)}
						</li>
					))}
				</ul>
			);
		}

		if (typeof value !== "string") {
			return <p>{String(value)}</p>;
		}

		const urlRegex = /(https?:\/\/[^\s]+)/g;
		const matches = value.match(urlRegex);
		if (matches) {
			return value.split(urlRegex).map((part, index) => {
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
				return part;
			});
		}

		return <p>{value}</p>;
	};

	const renderResults = (): ReactNode => {
		if (!results || results.length === 0) {
			return <p>No results found</p>;
		}

		const resultItem = results[0];

		return (
			<div>
				<h2>SaaS Solution: {query}</h2>
				{Object.entries(resultItem).map(([key, value]) => (
					<div key={key} className="result-item">
						<strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
						{renderValue(value)}
					</div>
				))}

				{sources && sources.length > 0 && (
					<div>
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

	const generatePDF = (data: Record<string, unknown>): void => {
		const doc = new jsPDF();

		doc.setFontSize(20);
		doc.setTextColor(0, 102, 204);
		doc.setFont("helvetica", "bold");
		doc.text("SaaS Solution: " + query, 20, 20);

		let yPos = 30;

		Object.entries(data).forEach(([key, value]) => {
			if (value) {
				doc.setFont("helvetica", "bold");
				doc.setFontSize(12);
				doc.setTextColor(0, 0, 0);
				doc.text(key.charAt(0).toUpperCase() + key.slice(1) + ":", 20, yPos);
				yPos += 10;

				doc.setFont("helvetica", "normal");
				doc.setFontSize(10);
				doc.setTextColor(0, 0, 0);
				const text =
					typeof value === "object"
						? (value as { Information?: string })?.Information ||
						  JSON.stringify(value)
						: String(value);
				doc.text(text, 20, yPos, { maxWidth: 170 } as TextOptions);
				yPos += (text.length / 30) * 1.1;

				const urlRegex = /(https?:\/\/[^\s]+)/g;
				const matches = text.match(urlRegex);
				if (matches) {
					matches.forEach((url: string) => {
						doc.setTextColor(0, 0, 255);
						doc.textWithLink(url, 20, yPos, { url } as LinkOptions);
						yPos += 10;
					});
				}

				yPos += 10;
			}
		});

		if (sources && sources.length > 0) {
			doc.setFont("helvetica", "bold");
			doc.setFontSize(12);
			doc.text("Sources:", 20, yPos);
			yPos += 10;

			doc.setFont("helvetica", "normal");
			doc.setTextColor(0, 0, 255);
			sources.forEach((source, index) => {
				const linkYPos = yPos + index * 10;
				doc.textWithLink(source, 20, linkYPos, { url: source } as LinkOptions);
			});
			yPos += 20;
		}

		doc.save(`${query}_report.pdf`);
	};

	return (
		<div className="results-page">
			<h1>Results for: {query}</h1>
			<div className="d-flex justify-content-center mb-3">
				<button className="btn btn-light me-2" onClick={() => navigate("/")}>
					Back to Home
				</button>
				<button
					className="btn btn-primary me-2"
					onClick={() => results && results[0] && generatePDF(results[0])}
				>
					Download PDF
				</button>
			</div>
			<div>{renderResults()}</div>
		</div>
	);
};

export default ResultsPage;
