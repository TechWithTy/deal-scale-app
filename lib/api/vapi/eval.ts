import type { EvalRunResponse } from "@/types/vapiAi/api/eval/run";

/**
 * Fetch evaluation run results from Vapi API
 * GET https://api.vapi.ai/eval/run/:id
 */
export async function fetchEvalRun(
	evalRunId: string,
	apiKey?: string,
): Promise<EvalRunResponse> {
	const apiKeyToUse = apiKey || process.env.NEXT_PUBLIC_VAPI_API_KEY || "";
	if (!apiKeyToUse) {
		throw new Error("Vapi API key is required");
	}

	const response = await fetch(`https://api.vapi.ai/eval/run/${evalRunId}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${apiKeyToUse}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Failed to fetch eval run: ${response.status} ${errorText}`,
		);
	}

	return response.json();
}
