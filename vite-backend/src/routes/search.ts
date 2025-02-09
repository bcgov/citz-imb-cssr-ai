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
			const prompt = generatePrompt(query, categories);

			const completion = await openai.chat.completions.create({
				model: "gpt-4",
				messages: [{ role: "user", content: prompt }],
			});

			const response = completion.choices[0].message.content;
			if (!response) {
				throw new Error("No response from OpenAI");
			}

			const sources = extractSources(response);
			const parsedResponse = parseResponse(response);

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
	const selectedCategories = Object.keys(categories).filter(
		(category) => categories[category] && category !== "selectAll"
	);

	const prompts = selectedCategories.map((category) => {
		const label =
			categoryLabels[category as keyof typeof categoryLabels] ||
			category.charAt(0).toUpperCase() + category.slice(1);
		const prompt = categoryPrompts[category as keyof typeof categoryPrompts];
		return `${label}: ${prompt}`;
	});

	return `${generalPrompt}
Give information about ${query} answering the following questions using 2 paragraphs (approx. 50-100 words per paragraph) per question:

${prompts.join("\n\n")}

Respond in JSON format with the categories as keys and the corresponding information as values. Ensure to include sources where applicable.`;
}

function extractSources(response: string): string[] {
	const sources: string[] = [];
	const sourceMatches = response.match(/Source:\s*(https?:\/\/[^\s]+)/g);

	if (sourceMatches) {
		sourceMatches.forEach((source) => {
			const url = source.replace("Source: ", "").trim();
			sources.push(url);
		});
	}

	return sources;
}

function parseResponse(
	response: string
): Record<string, string> | { error: string } {
	try {
		const jsonResponse = JSON.parse(response.trim());
		const labeledResponse: Record<string, string> = {};

		for (const [key, value] of Object.entries(jsonResponse)) {
			const label = categoryLabels[key as keyof typeof categoryLabels] || key;
			labeledResponse[label] = value as string;
		}

		return labeledResponse;
	} catch (error) {
		console.error("Error parsing JSON response:", error);
		return {
			error: `Unable to parse JSON response: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		};
	}
}
