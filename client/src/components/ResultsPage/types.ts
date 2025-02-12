export interface LocationState {
	query: string;
	results: Record<string, unknown>[];
	sources: string[];
}

export interface TextOptions {
	maxWidth?: number;
}

export interface LinkOptions {
	url: string;
}
