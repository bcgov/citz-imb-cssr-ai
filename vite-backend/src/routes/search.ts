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

Respond in valid JSON format with category keys and information values. Include sources where applicable.`;
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
		const jsonResponse = JSON.parse(response.trim());

		if (typeof jsonResponse !== "object" || jsonResponse === null) {
			throw new Error("Invalid JSON structure");
		}

		return Object.fromEntries(
			Object.entries(jsonResponse).map(([key, value]) => [
				categoryLabels[key as keyof typeof categoryLabels] ?? key,
				value as string,
			])
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

async function validateCategories(categories: Record<string, boolean>) {
	const validCategories = Object.keys(categoryLabels);
	const invalid = Object.keys(categories).filter(
		(c) => !validCategories.includes(c)
	);

	if (invalid.length > 0) {
		throw new Error(`Invalid categories: ${invalid.join(", ")}`);
	}
}
