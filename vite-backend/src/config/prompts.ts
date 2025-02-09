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
	description: `Provide a comprehensive solution analysis including:
- Core functionality and primary use cases
- Data types processed (especially personal/sensitive information)
- Technical architecture overview
- Deployment model (SaaS/PaaS/IaaS)
- All information sources must be cited`,

	applicability: `Evaluate service coverage:
- Scope of security controls across all services
- Subcontractor/third-party handling
- Contractual flow-down requirements
- Exceptions or exclusions
- Evidence of implementation`,

	compliance_and_certifications: `Assess compliance status against:
1. CCCS Medium Cloud Control Profile
2. FedRAMP (moderate)
3. ISO/IEC 27001:2022
4. CSA STAR Level 2
5. Provincial IM/IT standards
Include certification dates, scope, and verification methods`,

	access_control: `Evaluate access control framework:
- Identity management lifecycle
- Role-based access control (RBAC)
- Privilege management
- Access review procedures
- Session management
- Implementation evidence`,

	authentication: `Analyze authentication mechanisms:
- MFA implementation details
- Privileged access requirements
- Password policies
- Session management
- Industry standard compliance`,

	security_awareness: `Assess training program:
- Content coverage
- Delivery methods
- Completion tracking
- Frequency of updates
- Compliance monitoring
- Effectiveness measures`,

	log_generation: `Evaluate logging capabilities:
- Log types and content
- Retention periods
- Access methods
- Real-time correlation
- Threat detection integration
- Export capabilities`,

	investigations_support: `Detail investigation processes:
- Report retention (2-year minimum)
- E-discovery capabilities
- Chain of custody procedures
- Investigation workflow
- Evidence handling`,

	development_and_vulnerability: `Assess security practices:
- Development methodology
- Vulnerability management
- Patch processes
- Testing approaches:
  * Static analysis
  * Dynamic testing
  * Penetration testing
- Remediation procedures`,

	business_continuity: `Evaluate continuity planning:
- BC/DR plan components
- Recovery objectives
- Backup procedures
- Testing frequency
- Plan maintenance
- Documentation currency`,

	incident_response: `Review incident management:
- Response plan components
- Team structure
- Testing frequency
- Update procedures
- Integration with other processes`,

	breach_notifications: `Analyze notification procedures:
- 24-hour notification process
- Incident classification
- Communication channels
- Documentation requirements
- Follow-up procedures`,
} as const;
