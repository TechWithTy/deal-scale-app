/**
 * A2A Protocol Client
 * Handles communication with A2A-compatible agents
 * Based on: https://github.com/a2aproject/A2A
 */

import type {
	Agent,
	A2ATask,
	A2ATaskRequest,
	A2ATaskResponse,
	A2AAgentCard,
} from "./types";

/**
 * A2A Client for agent communication
 * Uses JSON-RPC 2.0 over HTTP(S) per A2A spec
 */
export class A2AClient {
	private baseUrl: string;
	private apiKey?: string;

	constructor(baseUrl: string = "/api/agents", apiKey?: string) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
	}

	/**
	 * Discover agents via A2A protocol
	 * In production, this would query agent registries
	 */
	async discoverAgents(): Promise<Agent[]> {
		try {
			const response = await fetch(`${this.baseUrl}/discover`, {
				method: "GET",
				headers: this.getHeaders(),
			});

			if (!response.ok) {
				throw new Error(`Agent discovery failed: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Agent discovery error:", error);
			// Fallback to mock agents in development
			return [];
		}
	}

	/**
	 * Fetch Agent Card
	 * https://a2a-protocol.org/specification/agent-card/
	 */
	async getAgentCard(agentCardUrl: string): Promise<A2AAgentCard> {
		const response = await fetch(agentCardUrl, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch agent card: ${response.statusText}`);
		}

		return await response.json();
	}

	/**
	 * Create Task (JSON-RPC 2.0)
	 * POST /agent-endpoint with JSON-RPC payload
	 */
	async createTask(request: A2ATaskRequest): Promise<A2ATaskResponse> {
		const { agentId, prompt, context, streaming, maxDuration } = request;

		// JSON-RPC 2.0 request
		const jsonRpcRequest = {
			jsonrpc: "2.0",
			id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			method: "tasks/create",
			params: {
				prompt,
				context: context || {},
				config: {
					streaming: streaming || false,
					maxDuration: maxDuration || 300,
				},
			},
		};

		try {
			const response = await fetch(`${this.baseUrl}/${agentId}/invoke`, {
				method: "POST",
				headers: {
					...this.getHeaders(),
					"Content-Type": "application/json",
				},
				body: JSON.stringify(jsonRpcRequest),
			});

			if (!response.ok) {
				throw new Error(`Task creation failed: ${response.statusText}`);
			}

			const jsonRpcResponse = await response.json();

			if (jsonRpcResponse.error) {
				throw new Error(jsonRpcResponse.error.message);
			}

			return {
				taskId: jsonRpcResponse.result.taskId,
				status: jsonRpcResponse.result.status,
				result: jsonRpcResponse.result.result,
			};
		} catch (error) {
			console.error("Task creation error:", error);
			throw error;
		}
	}

	/**
	 * Get Task Status
	 */
	async getTaskStatus(taskId: string): Promise<A2ATask> {
		const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
			method: "GET",
			headers: this.getHeaders(),
		});

		if (!response.ok) {
			throw new Error(`Failed to get task status: ${response.statusText}`);
		}

		return await response.json();
	}

	/**
	 * Cancel Task
	 */
	async cancelTask(taskId: string): Promise<void> {
		const response = await fetch(`${this.baseUrl}/tasks/${taskId}/cancel`, {
			method: "POST",
			headers: this.getHeaders(),
		});

		if (!response.ok) {
			throw new Error(`Failed to cancel task: ${response.statusText}`);
		}
	}

	/**
	 * Stream Task Results (SSE)
	 */
	async *streamTask(taskId: string): AsyncGenerator<string, void, unknown> {
		const response = await fetch(`${this.baseUrl}/tasks/${taskId}/stream`, {
			method: "GET",
			headers: {
				...this.getHeaders(),
				Accept: "text/event-stream",
			},
		});

		if (!response.ok || !response.body) {
			throw new Error(`Failed to stream task: ${response.statusText}`);
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6);
						if (data === "[DONE]") return;
						yield data;
					}
				}
			}
		} finally {
			reader.releaseLock();
		}
	}

	/**
	 * Get headers for requests
	 */
	private getHeaders(): Record<string, string> {
		const headers: Record<string, string> = {
			Accept: "application/json",
		};

		if (this.apiKey) {
			headers.Authorization = `Bearer ${this.apiKey}`;
		}

		return headers;
	}
}

/**
 * Singleton instance
 */
let clientInstance: A2AClient | null = null;

export const getA2AClient = (): A2AClient => {
	if (!clientInstance) {
		clientInstance = new A2AClient();
	}
	return clientInstance;
};
