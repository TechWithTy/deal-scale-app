/**
 * Types for Vapi Eval Run API
 * GET /eval/run/:id
 */

export interface EvalRunResult {
	status: "pass" | "fail";
	messages: Array<{
		role: string;
		content: string;
	}>;
	startedAt: string;
	endedAt: string;
}

export interface EvalRunCost {
	type: string;
	model?: string;
	cost: number;
}

export interface EvalRunTarget {
	assistant: {
		// Simplified - full structure is too large
		name: string;
		[key: string]: unknown;
	};
	assistantId: string;
	type: string;
	[key: string]: unknown;
}

export interface EvalRunEval {
	messages: Array<{
		role: string;
		[key: string]: unknown;
	}>;
	type: string;
	name?: string;
	description?: string;
}

export interface EvalRunResponse {
	status: "running" | "ended";
	endedReason:
		| "mockConversation.done"
		| "error"
		| "timeout"
		| "cancelled"
		| "aborted";
	target: EvalRunTarget;
	id: string;
	orgId: string;
	createdAt: string;
	startedAt: string;
	endedAt?: string;
	results: EvalRunResult[];
	cost: number;
	costs: EvalRunCost[];
	type: "eval";
	eval?: EvalRunEval;
	endedMessage?: string | null;
	evalId?: string | null;
}
