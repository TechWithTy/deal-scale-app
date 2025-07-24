import type { ToolMessage } from "../calls/create";
import type { ToolType } from "./create";

export interface GetToolResponse {
	async: boolean;
	messages: ToolMessage[];
	type: ToolType;
	id: string;
	orgId: string;
	createdAt: string;
	updatedAt: string;
	function: {
		name: string;
		description: string;
		parameters: {
			type: "object";
			properties: Record<string, string>;
			required: string[];
		};
	};
	server: {
		timeoutSeconds: number;
		url: string;
		secret: string;
	};
}
