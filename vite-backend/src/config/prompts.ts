export const generalPrompt = `Act as a Senior Cloud Security Analyst specializing in Canadian public sector compliance. 
Provide comprehensive yet concise responses that:
1. Explicitly address all aspects of the question
2. Reference specific clauses from CCCS Medium Cloud Control Profile, PIPEDA, and ISO 27001
3. Distinguish between verified facts and professional judgment
4. Include concrete examples where applicable
5. Cite official documentation sources using primary references
6. Use clear section headers for each compliance domain

Format requirements:
- Begin with "Based on analysis of [solution name]..."
- Maintain technical accuracy while avoiding unnecessary jargon
- If uncertain about any aspect, state this explicitly
- Response must be valid JSON without markdown formatting
- Keep sections between 100-200 words`;

export const categoryPrompts = {
	description:
		"Give a description of the solution, its purpose, key features, and typical usage. Specify the types of data collected, including whether personal information is involved. Please include the sources of the information you used, if applicable.",
	applicability:
		"Does the solution apply the terms of this schedule to all services, including those by subcontractors, unless stated otherwise? Provide sources.",
	compliance_and_certifications:
		"Does the solution comply with the Canadian Centre for Cyber Security Medium Cloud Control Profile, US FedRAMP, ISO/IEC 27001, CSA STAR Level 2, ISO/IEC 27001 based on IT controls in ISO/IEC 27002:2022, and applicable Province IM/IT standards? Include sources.",
	access_control:
		"Does the solution restrict access to contractor systems based on the Agreement terms? Does it have policies for onboarding/offboarding, access reviews, privilege control, and inactive timeouts? Provide sources.",
	authentication:
		"Does the solution use globally accepted authentication practices? Is multi-factor authentication required for privileged access? Provide sources.",
	security_awareness:
		"Does the solution provide annual security awareness training to all personnel performing services? How is this tracked? Include sources.",
	log_generation:
		"How are detailed system logs generated and retained for 90 days? How are logs provided to the organization on request? What methods are used to correlate logs for real-time threat detection? Provide sources.",
	investigations_support:
		"Does the solution retain security investigation reports for 2 years? Describe how investigation support, e-discovery, and chain of custody are handled. Provide sources.",
	development_and_vulnerability:
		"Does the solution have a security policy based on industry standards? How are systems secured, vulnerabilities patched, and testing done (static, dynamic, penetration)? Provide sources.",
	business_continuity:
		"Does the solution have a business continuity and disaster recovery plan? How are backups tested, and plans reviewed? Include sources.",
	incident_response:
		"Does the solution have an incident management and response plan? How often are these plans reviewed and tested? Provide sources.",
	breach_notifications:
		"Describe the solution's process for notifying the organization within 24 hours of a breach or incident affecting Province Information. Include sources.",
} as const;
