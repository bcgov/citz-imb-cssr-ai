export interface Categories {
	description: boolean;
	applicability: boolean;
	compliance_and_certifications: boolean;
	access_control: boolean;
	authentication: boolean;
	security_awareness: boolean;
	log_generation: boolean;
	investigations_support: boolean;
	development_and_vulnerability: boolean;
	business_continuity: boolean;
	incident_response: boolean;
	breach_notifications: boolean;
	selectAll: boolean;
}

export interface SearchResponse {
	results: Record<string, unknown>[];
	sources: string[];
}

export const categoryLabels: Record<string, string> = {
	description: "Description",
	applicability: "Applicability",
	compliance_and_certifications: "Compliance and Certifications",
	access_control: "Access Control",
	authentication: "Authentication",
	security_awareness: "Security Awareness",
	log_generation: "Log Generation",
	investigations_support: "Investigations Support",
	development_and_vulnerability: "Development and Vulnerability",
	business_continuity: "Business Continuity",
	incident_response: "Incident Response",
	breach_notifications: "Breach Notifications",
	selectAll: "Select All",
};
