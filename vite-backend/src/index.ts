import express from "express";
import { config } from "dotenv";
import { OpenAI } from "openai";
import { createSearchRouter } from "./routes/search.js";

// Load and validate environment variables
config();

const { API_HTTP_PORT, OPENAI_API_KEY } = process.env;

// Ensure required environment variables are present
if (!OPENAI_API_KEY) {
	console.error("OPENAI_API_KEY environment variable is required");
	process.exit(1);
}

// Initialize Express application and configure port
const app = express();
const PORT = parseInt(API_HTTP_PORT ?? "8000", 10);

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

// Configure global middleware
app.use(express.json());

// Health check endpoints
app.get("/", (_req, res) => {
	res.send("Server is running correctly");
});

app.get("/api/health", (_req, res) => {
	res.status(200).json({
		status: "healthy",
		timestamp: new Date().toISOString(),
	});
});

// Mount API routes
app.use("/api/search", createSearchRouter(openai));

// Global error handling middleware
app.use(
	(
		err: Error,
		_req: express.Request,
		res: express.Response,
		_next: express.NextFunction
	) => {
		// Log error details for debugging
		console.error("Unhandled error:", err);
		res.status(500).json({
			error: "Internal server error",
			message: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
	}
);

// Start the server and log startup information
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
