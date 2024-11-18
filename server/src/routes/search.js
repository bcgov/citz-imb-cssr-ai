const express = require('express');
const router = express.Router();

const productDatabase = {
    
    "salesforce": {
        description: "Salesforce is a cloud-based Customer Relationship Management (CRM) platform that helps businesses manage customer interactions and sales processes. It provides tools for marketing automation and customer analytics.",
        applicability: "Salesforce is widely applicable across various industries, from retail to finance, helping organizations improve customer engagement and operational efficiency.",
        compliance_and_certifications: "Salesforce adheres to global compliance standards such as GDPR and CCPA, ensuring data protection and privacy. It also holds certifications like ISO 27001.",
        access_control: "The platform employs granular access controls, allowing administrators to set specific permissions for different user roles to safeguard sensitive data.",
        authentication: "Salesforce offers robust authentication options, including multi-factor authentication and single sign-on, to enhance user security.",
        security_awareness: "Salesforce invests in security awareness programs, providing training and resources to help users recognize and mitigate potential security threats.",
        log_generation: "Salesforce generates detailed logs of user activity and system changes, which are retained for auditing and compliance purposes.",
        investigations_support: "The platform supports investigations by providing access to audit logs and reports, facilitating thorough security assessments.",
        development_and_vulnerability: "Salesforce follows best practices for secure development and regularly conducts vulnerability assessments to identify and address potential risks.",
        business_continuity: "Salesforce has comprehensive business continuity plans that include data backup and disaster recovery strategies to ensure service availability.",
        incident_response: "The platform has an established incident response protocol to manage and mitigate security incidents effectively.",
        breach_notifications: "Salesforce is committed to transparency and has a process in place to notify customers promptly in the event of a data breach."
    },
    "zoom": {
        description: "Zoom is a video conferencing platform that facilitates online meetings, webinars, and collaboration. It offers features like screen sharing and breakout rooms for enhanced interaction.",
        applicability: "Zoom is applicable for various sectors, including education, healthcare, and business, supporting remote communication and collaboration needs.",
        compliance_and_certifications: "Zoom complies with regulations like GDPR and HIPAA, ensuring secure communication for sensitive information. It holds certifications such as SOC 2 Type II.",
        access_control: "Zoom uses role-based access control to manage user permissions, allowing hosts to control who can join and participate in meetings.",
        authentication: "Zoom supports multiple authentication methods, including Single Sign-On (SSO) and multi-factor authentication, to enhance user security.",
        security_awareness: "Zoom promotes security awareness by providing resources and training on best practices for secure online meetings.",
        log_generation: "The platform generates logs for meeting access and usage, which are retained to assist in monitoring and troubleshooting.",
        investigations_support: "Zoom provides tools for forensic investigations, allowing access to logs and recordings in case of security incidents.",
        development_and_vulnerability: "Zoom follows secure development practices and conducts regular vulnerability assessments to maintain platform integrity.",
        business_continuity: "Zoom has robust business continuity plans to ensure service availability during outages, including redundancy and failover strategies.",
        incident_response: "Zoom has a structured incident response plan to address security incidents quickly and efficiently, minimizing potential damage.",
        breach_notifications: "In the event of a data breach, Zoom has procedures in place to notify affected users promptly, in compliance with legal requirements."
    }
    
};

router.post('/', (req, res) => {
    const { query, categories } = req.body;

    const productInfo = productDatabase[query.toLowerCase()];

    if (!productInfo) {
        return res.json({ query, results: [] });
    }

    const filteredResult = Object.keys(categories)
        .filter(category => categories[category] && category !== 'selectAll')
        .reduce((acc, category) => {
            acc[category] = productInfo[category];
            return acc;
        }, {});

    res.json({ query, results: [filteredResult] });
});

module.exports = router;