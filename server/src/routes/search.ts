import { Router, type Request, type Response } from "express";
import { OpenAI } from "openai";
import {
	categoryLabels,
	searchRequestSchema,
	type SearchResponse,
} from "../types.js";
import { generalPrompt, categoryPrompts } from "../config/prompts.js";

/**
 * Creates and configures the search router with OpenAI integration
 * @param openai - Initialized OpenAI client
 * @returns Express Router instance
 */
export const createSearchRouter = (openai: OpenAI) => {
	const router = Router();

	// Handle POST requests for AI-powered search
	router.post("/", async (req: Request, res: Response) => {
		try {
			// Validate request body against schema
			const parseResult = searchRequestSchema.safeParse(req.body);
			if (!parseResult.success) {
				return res.status(400).json({
					error: "Invalid request data",
					details: parseResult.error.issues,
				});
			}

			const { query, categories } = parseResult.data;

			// Validate selected categories
			await validateCategories(categories);

			// Generate and execute OpenAI query
			const prompt = generatePrompt(query, categories);
			const completion = await openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [{ role: "user", content: prompt }],
				temperature: 0.3, // Lower temperature for more focused responses
				max_tokens: 7000, // Limit response length for consistency
			});

			// Process OpenAI response
			const response = completion.choices[0].message.content;
			if (!response) {
				throw new Error("No response received from OpenAI");
			}

			// Extract and parse response data
			const sources = extractSources(response);
			const parsedResponse = parseResponse(response);

			if ("error" in parsedResponse) {
				return res.status(500).json({ error: parsedResponse.error });
			}

			// Construct and send final response
			const searchResponse: SearchResponse = {
				query,
				results: [parsedResponse],
				sources,
			};

			return res.json(searchResponse);
		} catch (error) {
			// Log and handle errors appropriately
			console.error("Error processing search request:", error);
			return res.status(500).json({
				error: "Error processing request",
				details: error instanceof Error ? error.message : "Unknown error",
			});
		}
	});

	return router;
};

/**
 * Generates the AI prompt based on user query and selected categories
 * @param query - User's search query
 * @param categories - Selected search categories
 * @returns Formatted prompt string
 */
function generatePrompt(
	query: string,
	categories: Record<string, boolean>
): string {
	// Filter and transform selected categories into prompts
	const selectedCategories = Object.entries(categories)
		.filter(([category, selected]) => selected && category !== "selectAll")
		.map(([category]) => {
			const label =
				categoryLabels[category as keyof typeof categoryLabels] ??
				category.charAt(0).toUpperCase() + category.slice(1);
			const prompt = categoryPrompts[category as keyof typeof categoryPrompts];
			return prompt ? `${label}: ${prompt}` : null;
		})
		.filter((prompt): prompt is string => prompt !== null);

	// Combine general prompt with category-specific prompts
	return `${generalPrompt}
Questions about ${query} (100-200 words per question):

${selectedCategories.join("\n\n")}

IMPORTANT: Your response MUST be a single valid JSON object with category keys and information values. 
Do not include any markdown formatting, prefixes, or suffixes. 
The response should start with '{' and end with '}'.
Each value must be a string.`;
}

/**
 * Extracts source URLs from the AI response
 * @param response - Raw AI response text
 * @returns Array of extracted source URLs
 */
function extractSources(response: string): string[] {
	const sourceRegex = /(?<=Source:\s)https?:\/\/[^\s]+/g;
	return Array.from(response.matchAll(sourceRegex), (match) => match[0]);
}

/**
 * Parses and validates the AI response into structured data
 * @param response - Raw AI response text
 * @returns Parsed response object or error
 */
function parseResponse(
	response: string
): Record<string, string> | { error: string } {
	try {
		// Clean and extract JSON content
		const cleanedResponse = response
			.trim()
			.replace(/```json\s*|\s*```/g, "")
			.replace(/^\n+/, "");

		const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error("No valid JSON structure found in response");
		}

		// Parse and validate JSON structure
		const jsonResponse = JSON.parse(jsonMatch[0]);
		if (!jsonResponse || typeof jsonResponse !== "object") {
			throw new Error("Invalid JSON structure: not an object");
		}

		// Transform and validate response entries
		return Object.fromEntries(
			Object.entries(jsonResponse).map(([key, value]) => {
				if (typeof value !== "string") {
					throw new Error(
						`Invalid value type for key "${key}": expected string`
					);
				}
				return [
					categoryLabels[key as keyof typeof categoryLabels] ?? key,
					value,
				];
			})
		);
	} catch (error) {
		console.error("Error parsing JSON response:", error);
		return {
			error: `JSON parsing failed: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		};
	}
}

/**
 * Validates the selected categories against known valid categories
 * @param categories - Selected categories object
 * @throws Error if invalid categories are found
 */
function validateCategories(categories: Record<string, boolean>): void {
	const validCategories = new Set(Object.keys(categoryLabels));
	const invalidCategories = Object.keys(categories).filter(
		(c) => !validCategories.has(c) && c !== "selectAll"
	);

	if (invalidCategories.length > 0) {
		throw new Error(`Invalid categories: ${invalidCategories.join(", ")}`);
	}
}
