import express from "express";
import { config } from "dotenv";
import { OpenAI } from "openai";
import { createSearchRouter } from "./routes/search.js";

// Load environment variables
config();

const { API_HTTP_PORT = "8000", OPENAI_API_KEY } = process.env;

if (!OPENAI_API_KEY) {
	console.error("OPENAI_API_KEY environment variable is required");
	process.exit(1);
}

const app = express();
const PORT = parseInt(API_HTTP_PORT, 10);

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

// Middleware
app.use(express.json());

// Basic routes
app.get("/", (_req, res) => {
	res.send("Server is running correctly");
});

app.get("/api/health", (_req, res) => {
	res.status(200).json({
		status: "healthy",
		timestamp: new Date().toISOString(),
	});
});

// API routes
app.use("/api/search", createSearchRouter(openai));

// Error handling middleware
app.use(
	(
		err: Error,
		_req: express.Request,
		res: express.Response,
		_next: express.NextFunction
	) => {
		console.error("Unhandled error:", err);
		res.status(500).json({
			error: "Internal server error",
			message: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
);

// Start server
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
