const express = require('express');
const router = express.Router();

const categoryLabels = {
    description: "Description",
    applicability: "Applicability",
    compliance_and_certifications: "Compliance and Certifications",
    access_control: "Access Control",
    authentication: "Authentication",
    security_awareness: "Security Awareness",
    log_generation: "Log Generation and Retention",
    investigations_support: "Investigations Support",
    development_and_vulnerability: "Development, Configuration and Vulnerability",
    business_continuity: "Business Continuity, Disaster Recovery and Backup Plans",
    incident_response: "Incident Response and Management",
    breach_notifications: "Breach Notifications",
    selectAll: "Select All"
};

const generalPrompt = "Provide a detailed description.";

const categoryPrompts = {
    description: "Give a description of the solution, its purpose, key features, and typical usage. Specify the types of data collected, including whether personal information is involved.",
    applicability: "Does the solution apply the terms of this schedule to all services, including those by subcontractors, unless stated otherwise?",
    compliance_and_certifications: "Does the solution comply with the Canadian Centre for Cyber Security Medium Cloud Control Profile, US FedRAMP, ISO/IEC 27001, CSA STAR Level 2, ISO/IEC 27001 based on IT controls in ISO/IEC 27002:2022, and applicable Province IM/IT standards?",
    access_control: "Does the solution restrict access to contractor systems based on the Agreement terms? Does it have policies for onboarding/offboarding, access reviews, privilege control, and inactive timeouts? Describe how conflicting duties are identified and segregation of duties is ensured. How often is user access reviewed to detect excessive privileges or unused accounts?",
    authentication: "Does the solution use globally accepted authentication practices? Is multi-factor authentication required for privileged access?",
    security_awareness: "Does the solution provide annual security awareness training to all personnel performing services? How is this tracked?",
    log_generation: "How are detailed system logs generated and retained for 90 days? How are logs provided to the organization on request? What methods are used to correlate logs for real-time threat detection?",
    investigations_support: "Does the solution retain security investigation reports for 2 years? Describe how investigation support, e-discovery, and chain of custody are handled.",
    development_and_vulnerability: "Does the solution have a security policy based on industry standards? How are systems secured, vulnerabilities patched, and testing done (static, dynamic, penetration)?",
    business_continuity: "Does the solution have a business continuity and disaster recovery plan? How are backups tested, and plans reviewed?",
    incident_response: "Does the solution have an incident management and response plan? How often are these plans reviewed and tested?",
    breach_notifications: "Describe the solution's process for notifying the organization within 24 hours of a breach or incident affecting Province Information."
};

router.post('/', async (req, res) => {
    const { query, categories } = req.body;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required and must be a string.' });
    }
    if (!categories || typeof categories !== 'object') {
        return res.status(400).json({ error: 'Categories must be an object.' });
    }

    const { openai } = require('../index');
    try {
        const prompt = generatePrompt(query, categories);
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
            temperature: 0.3
        });
        const response = completion.choices[0].message.content;
        const parsedResponse = parseResponse(response);
        if (parsedResponse.error) {
            return res.status(500).json({ error: parsedResponse.error });
        }
        res.json({ query, results: [parsedResponse] });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Error processing request', details: error.message });
    }
});

function generatePrompt(query, categories) {
    const selectedCategories = Object.keys(categories)
        .filter(category => categories[category] && category !== 'selectAll');
    
    const prompts = selectedCategories.map(category => 
        `${categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1)}: ${categoryPrompts[category]}`
    );

    return `${generalPrompt}
Give information about ${query} answering the following questions using minimum 50 words and maximum 100 words per question:
${prompts.join('\n\n')}
Respond in JSON format with the categories as keys and the corresponding information as values`;
}

function parseResponse(response) {
    console.log('Response received:', response); 
    const wordCount = response.split(' ').length;
    console.log('Word count:', wordCount); 

    try {
        let source = null;
        const sourceMatch = response.match(/Source:\s*(.+)/); 
        if (sourceMatch && sourceMatch[1]) {
            source = sourceMatch[1].trim(); 
            response = response.replace(/Source:\s*(.+)/, '').trim();
        }

        if (typeof response === 'string') {
            response = response.trim();
            const jsonResponse = JSON.parse(response);
            const labeledResponse = {};
            for (const key in jsonResponse) {
                const label = categoryLabels[key] || key; 
                labeledResponse[label] = jsonResponse[key];
            }

            if (source) {
                labeledResponse.source = source;
            }
            return labeledResponse;
        } else {
            throw new Error('The response is not a valid string.');
        }
    } catch (error) {
        console.error('Error parsing JSON response:', error);
        return { error: `Unable to parse JSON response: ${error.message}` };
    }
}

module.exports = router;


