"use client";

import { useRef } from "react";
import { Highlights } from "./Highlights";

export interface AiPreviewEditorProps {
	aiPreviewText: string;
	setAiPreviewText: (v: string) => void;
	aiPlanInput: string;
	aiPlanOutput: string;
	setAiPlanOutput: (v: string) => void;
	aiNeeds: string;
	aiMcp: string;
	setAiMcp: (v: string) => void;
	previewRef?: React.RefObject<HTMLDivElement>;
	mcpToolsOrdered: string[];
	needsChips: string[];
	onRemoveTool?: (tool: string) => void;
	onRemoveNeed?: (need: string) => void;
	toolNeedMap?: Record<string, string[]>;
	needToolMap?: Record<string, string[]>;
}

export function AiPreviewEditor({
	aiPreviewText,
	setAiPreviewText,
	aiPlanInput,
	aiPlanOutput,
	setAiPlanOutput,
	aiNeeds,
	aiMcp,
	setAiMcp,
	previewRef,
	mcpToolsOrdered,
	needsChips,
	onRemoveTool,
	onRemoveNeed,
	toolNeedMap,
	needToolMap,
}: AiPreviewEditorProps) {
	const localRef = useRef<HTMLDivElement | null>(null);
	const ref = previewRef ?? localRef;

	return (
		<div className="grid gap-2">
			<label className="text-sm font-medium">AI Preview</label>
			<div
				ref={ref}
				className="font-mono text-sm rounded-md border bg-background p-2 min-h-32 space-y-2 focus:outline-none"
				contentEditable
				suppressContentEditableWarning
				onInput={(e) => {
					const el = e.currentTarget as HTMLDivElement;
					const parts: string[] = [];
					el.childNodes.forEach((node) => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							const n = node as HTMLElement;
							if (
								n.dataset &&
								["plan-input", "plan-output", "needs", "mcp"].includes(
									(n as any).dataset.block,
								)
							)
								return;
							parts.push(n.textContent || "");
						} else {
							parts.push(node.textContent || "");
						}
					});
					// normalize nbsp
					setAiPreviewText(parts.join("").replace(/\u00A0/g, " "));
				}}
				onKeyDown={(e) => {
					if (
						e.key === "Backspace" &&
						aiPreviewText.trim().length === 0 &&
						aiMcp
					) {
						e.preventDefault();
						setAiMcp("");
					}
				}}
			>
				{/* Collapsible non-editable Input */}
				<details open={false} className="rounded-md border bg-muted p-2">
					<summary className="cursor-pointer text-xs font-medium">
						Input
					</summary>
					<div
						data-block="plan-input"
						contentEditable={false}
						className="mt-2 text-xs whitespace-pre-wrap"
					>
						{aiPlanInput}
					</div>
				</details>

				{/* Editable Output with inline highlights */}
				<div
					data-block="plan-output"
					contentEditable
					suppressContentEditableWarning
					className="rounded-md border bg-muted p-3 overflow-x-auto text-xs whitespace-pre-wrap focus:outline-none"
					onInput={(e) =>
						setAiPlanOutput((e.currentTarget as HTMLDivElement).innerText)
					}
				>
					{aiPlanOutput}
					<div className="mt-2" contentEditable={false}>
						<Highlights
							mcpTools={mcpToolsOrdered}
							needs={needsChips}
							onRemoveTool={onRemoveTool}
							onRemoveNeed={onRemoveNeed}
							toolNeedMap={toolNeedMap}
							needToolMap={needToolMap}
						/>
					</div>
				</div>

				{/* Narrative lines */}
				{aiPreviewText.split(/\r?\n/).map((line, i) => (
					<div key={`line-${i}`}>{line || <br />}</div>
				))}
				{/* Non-editable Needs list */}
				{aiNeeds && (
					<div
						data-block="needs"
						contentEditable={false}
						className="rounded-md border bg-muted p-3 overflow-x-auto text-xs whitespace-pre-wrap"
					>
						{aiNeeds}
					</div>
				)}
				{/* Embedded, non-editable MCP block */}
				{aiMcp && (
					<div
						data-block="mcp"
						contentEditable={false}
						className="rounded-md border bg-muted p-3 overflow-x-auto text-xs whitespace-pre-wrap"
					>
						{aiMcp}
					</div>
				)}
			</div>
			<p className="text-xs text-muted-foreground">
				Describe what the AI will do and list Needs as lines beginning with
				"Need:" (e.g., "Need: leadId"). The MCP block is non-editable; remove it
				via Backspace when narrative is empty or by regenerating.
			</p>
		</div>
	);
}
