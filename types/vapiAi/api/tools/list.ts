// Reuse existing Tool type
import type { ToolType } from "./create";
export interface ListToolsResponse {
	tools: ToolType[];
	totalCount: number;
}
