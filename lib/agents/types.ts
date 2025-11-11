/**
 * A2A Agent Types
 * Based on Agent2Agent Protocol: https://github.com/a2aproject/A2A
 */

export type AgentStatus = "online" | "offline" | "busy" | "unknown";
export type AgentType = "a2a" | "internal" | "mcp" | "custom";

/**
 * A2A Agent Card (simplified)
 * Full spec: https://a2a-protocol.org/specification/agent-card/
 */
export interface A2AAgentCard {
	name: string;
	description: string;
	version: string;
	endpoint: string;
	skills: string[];
	transports: Array<{
		protocol: "http" | "grpc";
		url: string;
		auth?: {
			type: "bearer" | "apiKey" | "oauth2";
		};
	}>;
}

/**
 * Agent Definition for Platform Use
 */
export interface Agent {
	id: string;
	name: string;
	description: string;
	type: AgentType;
	status: AgentStatus;

	// A2A Protocol Fields
	agentCardUrl?: string;
	endpoint?: string;
	skills?: string[];

	// Metadata
	category?:
		| "analysis"
		| "evaluation"
		| "communication"
		| "research"
		| "automation";
	icon?: string;
	lastSeen?: Date;
	responseTime?: number; // ms

	// Capabilities
	capabilities?: {
		streaming?: boolean;
		async?: boolean;
		fileSupport?: boolean;
		maxTaskDuration?: number; // seconds
	};
}

/**
 * A2A Task (JSON-RPC)
 */
export interface A2ATask {
	id: string;
	agentId: string;
	status: "pending" | "running" | "completed" | "failed" | "cancelled";
	prompt: string;
	context?: Record<string, unknown>;
	result?: unknown;
	error?: string;
	createdAt: Date;
	updatedAt: Date;
	completedAt?: Date;
}

/**
 * A2A Task Request
 */
export interface A2ATaskRequest {
	agentId: string;
	prompt: string;
	context?: Record<string, unknown>;
	streaming?: boolean;
	maxDuration?: number;
}

/**
 * A2A Task Response
 */
export interface A2ATaskResponse {
	taskId: string;
	status: A2ATask["status"];
	result?: unknown;
	error?: string;
}
