// Assuming Tool, ToolMessage, ToolFunction, ToolServer, etc., already exist

import type { ToolMessage } from "../calls/create";
import type { ToolFunction, ToolServer } from "../squad/create";
import type { ToolType } from "./create";

export interface UpdateToolResponse {
	async: boolean;
	messages: ToolMessage[];
	type: ToolType; // Reuse from existing enum
	id: string;
	orgId: string;
	createdAt: string; // ISO timestamp
	updatedAt: string; // ISO timestamp
	function: ToolFunction; // Reuse existing type
	server: ToolServer; // Reuse existing type
}
