import { z } from "zod";

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

export type CategoryKey = keyof typeof categoryLabels;
export type CategoryLabel = (typeof categoryLabels)[CategoryKey];

export const searchRequestSchema = z.object({
	query: z.string().min(1),
	categories: z.record(z.boolean()),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;

export interface SearchResponse {
	query: string;
	results: Record<string, string>[];
	sources: string[];
}
