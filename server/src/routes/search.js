const express = require('express');
const router = express.Router();

// Mapping of categories to readable labels (used in the frontend to display headers).
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

// General prompt used for generating the OpenAI query.
const generalPrompt = "Provide a detailed description in a security analyst context.";

// Detailed prompts for each category, used to guide OpenAI responses.
const categoryPrompts = {
    description: "Give a description of the solution, its purpose, key features, and typical usage. Specify the types of data collected, including whether personal information is involved. Please include the sources of the information you used, if applicable.",
    applicability: "Does the solution apply the terms of this schedule to all services, including those by subcontractors, unless stated otherwise? Provide sources.",
    compliance_and_certifications: "Does the solution comply with the Canadian Centre for Cyber Security Medium Cloud Control Profile, US FedRAMP, ISO/IEC 27001, CSA STAR Level 2, ISO/IEC 27001 based on IT controls in ISO/IEC 27002:2022, and applicable Province IM/IT standards? Include sources.",
    access_control: "Does the solution restrict access to contractor systems based on the Agreement terms? Does it have policies for onboarding/offboarding, access reviews, privilege control, and inactive timeouts? Provide sources.",
    authentication: "Does the solution use globally accepted authentication practices? Is multi-factor authentication required for privileged access? Provide sources.",
    security_awareness: "Does the solution provide annual security awareness training to all personnel performing services? How is this tracked? Include sources.",
    log_generation: "How are detailed system logs generated and retained for 90 days? How are logs provided to the organization on request? What methods are used to correlate logs for real-time threat detection? Provide sources.",
    investigations_support: "Does the solution retain security investigation reports for 2 years? Describe how investigation support, e-discovery, and chain of custody are handled. Provide sources.",
    development_and_vulnerability: "Does the solution have a security policy based on industry standards? How are systems secured, vulnerabilities patched, and testing done (static, dynamic, penetration)? Provide sources.",
    business_continuity: "Does the solution have a business continuity and disaster recovery plan? How are backups tested, and plans reviewed? Include sources.",
    incident_response: "Does the solution have an incident management and response plan? How often are these plans reviewed and tested? Provide sources.",
    breach_notifications: "Describe the solution's process for notifying the organization within 24 hours of a breach or incident affecting Province Information. Include sources."
};

// POST request handler for receiving user input and processing the response using OpenAI
router.post('/', async (req, res) => {
    const { query, categories } = req.body;

    // Validate the input query and categories
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required and must be a string.' });
    }
    if (!categories || typeof categories !== 'object') {
        return res.status(400).json({ error: 'Categories must be an object.' });
    }

    const { openai } = require('../index');
    try {
        // Generate the prompt to send to OpenAI based on selected categories
        const prompt = generatePrompt(query, categories);
        
        // Use OpenAI's GPT-4 model to generate a response
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2000,
            temperature: 0.3
        });

        let response = completion.choices[0].message.content;
        
        // Extract sources from the response
        const sources = extractSources(response); 

        // Parse the response into a labeled structure
        const parsedResponse = parseResponse(response);

        if (parsedResponse.error) {
            return res.status(500).json({ error: parsedResponse.error });
        }

        // Include the sources in the response before sending it to the frontend
        res.json({ query, results: [parsedResponse], sources });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Error processing request', details: error.message });
    }
});

// Function to generate the prompt for OpenAI based on selected categories
function generatePrompt(query, categories) {
    const selectedCategories = Object.keys(categories)
        .filter(category => categories[category] && category !== 'selectAll');
    
    const prompts = selectedCategories.map(category => 
        `${categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1)}: ${categoryPrompts[category]}`
    );

    return `${generalPrompt}\nGive information about ${query} answering the following questions using 2 paragraphs (approx. 50-100 words per paragraph) per question:\n${prompts.join('\n\n')}\nRespond in JSON format with the categories as keys and the corresponding information as values. Ensure to include sources where applicable.`;
}

// Function to extract sources from the response
function extractSources(response) {
    const sources = [];
    
    // Regex to match URLs starting with http or https
    const sourceMatches = response.match(/Source:\s*(https?:\/\/[^\s]+)/g); 

    if (sourceMatches) {
        sourceMatches.forEach(source => {
            // Remove the 'Source: ' part and trim any spaces
            const url = source.replace('Source: ', '').trim();
            sources.push(url);
        });
    }

    return sources;
}

// Function to parse the response into a more structured format
function parseResponse(response) {
    console.log('Response received:', response); 
    const wordCount = response.split(' ').length;
    console.log('Word count:', wordCount); 

    try {
        if (typeof response === 'string') {
            response = response.trim();
            const jsonResponse = JSON.parse(response);
            const labeledResponse = {};

            // Map the categories to their corresponding labels
            for (const key in jsonResponse) {
                const label = categoryLabels[key] || key; 
                labeledResponse[label] = jsonResponse[key];
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
