import { Router, type Request, type Response } from "express";
import { OpenAI } from "openai";
import {
	categoryLabels,
	searchRequestSchema,
	type SearchResponse,
} from "../types.js";
import { generalPrompt, categoryPrompts } from "../config/prompts.js";

export const createSearchRouter = (openai: OpenAI) => {
	const router = Router();

	router.post("/", async (req: Request, res: Response) => {
		const parseResult = searchRequestSchema.safeParse(req.body);

		if (!parseResult.success) {
			return res.status(400).json({
				error: "Invalid request data",
				details: parseResult.error.issues,
			});
		}

		const { query, categories } = parseResult.data;

		try {
			const [prompt, validation] = await Promise.all([
				generatePrompt(query, categories),
				validateCategories(categories),
			]);

			const completion = await openai.chat.completions.create({
				model: "gpt-4",
				messages: [{ role: "user", content: prompt }],
			});

			const response = completion.choices[0].message.content;
			if (!response) {
				throw new Error("No response from OpenAI");
			}

			const [sources, parsedResponse] = await Promise.all([
				extractSources(response),
				parseResponse(response),
			]);

			if ("error" in parsedResponse) {
				return res.status(500).json({ error: parsedResponse.error });
			}

			const searchResponse: SearchResponse = {
				query,
				results: [parsedResponse],
				sources,
			};

			res.json(searchResponse);
		} catch (error) {
			console.error("Error processing request:", error);
			res.status(500).json({
				error: "Error processing request",
				details: error instanceof Error ? error.message : "Unknown error",
			});
		}
	});

	return router;
};

function generatePrompt(
	query: string,
	categories: Record<string, boolean>
): string {
	const selectedCategories = Object.entries(categories)
		.filter(([category, selected]) => selected && category !== "selectAll")
		.map(([category]) => category);

	const prompts = selectedCategories.flatMap((category) => {
		const label =
			categoryLabels[category as keyof typeof categoryLabels] ??
			`${category[0].toUpperCase()}${category.slice(1)}`;
		const prompt = categoryPrompts[category as keyof typeof categoryPrompts];
		return prompt ? `${label}: ${prompt}` : [];
	});

	return `${generalPrompt}
Questions about ${query} (50-100 words per question):

${prompts.join("\n\n")}

IMPORTANT: Your response MUST be a single valid JSON object with category keys and information values. 
Do not include any markdown formatting, prefixes, or suffixes. 
The response should start with '{' and end with '}'. 
Each value must be a string.
Example format:
{
  "category1": "information about category1",
  "category2": "information about category2"
}`;
}

function extractSources(response: string): string[] {
	return Array.from(
		response.matchAll(/(?<=Source:\s)https?:\/\/[^\s]+/g),
		(match) => match[0]
	);
}

function parseResponse(
	response: string
): Record<string, string> | { error: string } {
	try {
		// First, try to clean the response if it contains any markdown-like formatting
		let cleanedResponse = response.trim();

		// Remove any markdown code block indicators
		cleanedResponse = cleanedResponse.replace(/```json\s*|\s*```/g, "");

		// If response starts with a newline, remove it
		cleanedResponse = cleanedResponse.replace(/^\n+/, "");

		// Attempt to parse the cleaned response
		let jsonResponse: unknown;
		try {
			jsonResponse = JSON.parse(cleanedResponse);
		} catch (parseError) {
			// If parsing fails, try to extract JSON-like content
			const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				try {
					jsonResponse = JSON.parse(jsonMatch[0]);
				} catch {
					throw new Error("Could not parse JSON content");
				}
			} else {
				throw new Error("No valid JSON structure found in response");
			}
		}

		// Validate the parsed response
		if (typeof jsonResponse !== "object" || jsonResponse === null) {
			throw new Error("Invalid JSON structure: not an object");
		}

		// Convert and validate each entry
		const entries = Object.entries(jsonResponse).map(([key, value]) => {
			if (typeof value !== "string") {
				throw new Error(`Invalid value type for key "${key}": expected string`);
			}
			return [categoryLabels[key as keyof typeof categoryLabels] ?? key, value];
		});

		return Object.fromEntries(entries);
	} catch (error) {
		console.error("Error parsing JSON response:", error);
		console.error("Raw response:", response);
		return {
			error: `JSON parsing failed: ${
				error instanceof Error ? error.message : "Unknown error"
			}. Please try again.`,
		};
	}
}

async function validateCategories(categories: Record<string, boolean>) {
	const validCategories = Object.keys(categoryLabels);
	const invalid = Object.keys(categories).filter(
		(c) => !validCategories.includes(c)
	);

	if (invalid.length > 0) {
		throw new Error(`Invalid categories: ${invalid.join(", ")}`);
	}
}
