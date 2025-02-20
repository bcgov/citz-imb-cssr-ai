import { z } from "zod";

// Category labels mapping for UI display and response formatting
export const categoryLabels = {
	description: "Description",
	applicability: "Applicability",
	compliance_and_certifications: "Compliance and Certifications",
	access_control: "Access Control",
	authentication: "Authentication",
	security_awareness: "Security Awareness",
	log_generation: "Log Generation and Retention",
	investigations_support: "Investigations Support",
	development_and_vulnerability: "Development, Configuration and Vulnerability",
	business_continuity:
		"Business Continuity, Disaster Recovery and Backup Plans",
	incident_response: "Incident Response and Management",
	breach_notifications: "Breach Notifications",
	selectAll: "Select All",
} as const;

// Type definitions for category keys and labels
export type CategoryKey = keyof typeof categoryLabels;
export type CategoryLabel = (typeof categoryLabels)[CategoryKey];

// Request validation schema using Zod
export const searchRequestSchema = z.object({
	query: z.string().min(1).describe("User's search query"),
	categories: z.record(z.boolean()).describe("Selected search categories"),
});

// Type definitions for request and response structures
export type SearchRequest = z.infer<typeof searchRequestSchema>;

export interface SearchResponse {
	query: string; // Original search query
	results: Record<string, string>[]; // Array of category-response pairs
	sources: string[]; // List of reference URLs
}
