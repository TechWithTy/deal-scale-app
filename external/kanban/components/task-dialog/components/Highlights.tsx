"use client";
import { useState } from "react";
export interface HighlightsProps {
	mcpTools: string[];
	needs: string[];
	onRemoveTool?: (tool: string) => void;
	onRemoveNeed?: (need: string) => void;
	toolNeedMap?: Record<string, string[]>; // tool -> needs[]
	needToolMap?: Record<string, string[]>; // need -> tools[]
}

export function Highlights({
	mcpTools,
	needs,
	onRemoveTool,
	onRemoveNeed,
	toolNeedMap = {},
	needToolMap = {},
}: HighlightsProps) {
	if (mcpTools.length === 0 && needs.length === 0) return null;
	const [hoverTool, setHoverTool] = useState<string | null>(null);
	const [hoverNeed, setHoverNeed] = useState<string | null>(null);
	const isNeedLinkedToHoverTool = (n: string) =>
		hoverTool ? (toolNeedMap[hoverTool] || []).includes(n) : false;
	const isToolLinkedToHoverNeed = (t: string) =>
		hoverNeed ? (needToolMap[hoverNeed] || []).includes(t) : false;

	return (
		<div className="grid gap-2">
			<label className="text-sm font-medium">Highlights</label>
			<div className="flex flex-wrap gap-2">
				{mcpTools.map((t) => {
					const linkedActive = isToolLinkedToHoverNeed(t);
					return (
						<span
							key={t}
							onMouseEnter={() => setHoverTool(t)}
							onMouseLeave={() => setHoverTool(null)}
							className={`group inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors ${linkedActive ? "ring-2 ring-amber-400 bg-secondary/60" : "bg-secondary"} text-secondary-foreground`}
							title="MCP Tool"
						>
							Tool: {t}
							{onRemoveTool && (
								<button
									type="button"
									className="ml-1 hidden group-hover:inline-block text-[10px] leading-none opacity-70 hover:opacity-100"
									onClick={() => onRemoveTool(t)}
									aria-label={`Remove tool ${t}`}
								>
									×
								</button>
							)}
						</span>
					);
				})}
				{needs.map((n, i) => {
					const linkedActive = isNeedLinkedToHoverTool(n);
					return (
						<span
							key={`${n}-${i}`}
							onMouseEnter={() => setHoverNeed(n)}
							onMouseLeave={() => setHoverNeed(null)}
							className={`group inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors ${linkedActive ? "ring-2 ring-secondary bg-amber-100 dark:bg-amber-900/50" : "bg-amber-100 dark:bg-amber-900/30"} text-amber-900 dark:text-amber-200`}
							title="Need"
						>
							Need: {n}
							{onRemoveNeed && (
								<button
									type="button"
									className="ml-1 hidden group-hover:inline-block text-[10px] leading-none opacity-70 hover:opacity-100"
									onClick={() => onRemoveNeed(n)}
									aria-label={`Remove need ${n}`}
								>
									×
								</button>
							)}
						</span>
					);
				})}
			</div>
		</div>
	);
}
