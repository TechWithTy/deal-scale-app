/**
 * Prompt Flowchart Preview
 * Generates and displays a Mermaid flowchart from POML prompt structure
 */

"use client";

import { Eye } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/_utils";
import { useEffect, useRef } from "react";

interface PromptFlowchartPreviewProps {
	promptValue: string;
	disabled?: boolean;
	className?: string;
}

/**
 * Parse POML to extract workflow structure
 */
const parsePOMLToMermaid = (poml: string): string => {
	if (!poml.trim()) return "";

	// Extract key sections from POML
	const roleMatch = poml.match(/<role>(.*?)<\/role>/s);
	const taskMatch = poml.match(/<task>(.*?)<\/task>/s);
	const instructionsMatch = poml.match(/<instructions>(.*?)<\/instructions>/s);
	const workflowMatch = poml.match(/<workflow[^>]*>(.*?)<\/workflow>/s);
	const agentsMatch = poml.match(/<agents>(.*?)<\/agents>/s);

	// Extract variables ({{variable}})
	const variables = Array.from(poml.matchAll(/\{\{(\w+)\}\}/g)).map(
		(m) => m[1],
	);
	const uniqueVars = [...new Set(variables)];

	let mermaid = "flowchart TD\n";
	let nodeId = 0;

	// Start node
	mermaid += `    Start([Start])\n`;
	let lastNode = "Start";

	// Role
	if (roleMatch) {
		const role = roleMatch[1].trim().substring(0, 40);
		mermaid += `    Role${nodeId}["Role: ${role}..."]\n`;
		mermaid += `    ${lastNode} --> Role${nodeId}\n`;
		lastNode = `Role${nodeId}`;
		nodeId++;
	}

	// Task
	if (taskMatch) {
		const task = taskMatch[1].trim().substring(0, 40);
		mermaid += `    Task${nodeId}["Task: ${task}..."]\n`;
		mermaid += `    ${lastNode} --> Task${nodeId}\n`;
		lastNode = `Task${nodeId}`;
		nodeId++;
	}

	// Variables
	if (uniqueVars.length > 0) {
		mermaid += `    Vars${nodeId}{{"Variables: ${uniqueVars.slice(0, 3).join(", ")}${uniqueVars.length > 3 ? "..." : ""}"}}\n`;
		mermaid += `    ${lastNode} --> Vars${nodeId}\n`;
		lastNode = `Vars${nodeId}`;
		nodeId++;
	}

	// Agents
	if (agentsMatch) {
		const agentMatches = Array.from(
			agentsMatch[1].matchAll(/<agent\s+name="(\w+)"/g),
		);
		if (agentMatches.length > 0) {
			mermaid += `    Agents${nodeId}[["AI Agents: ${agentMatches
				.map((m) => m[1])
				.slice(0, 2)
				.join(", ")}"]]\n`;
			mermaid += `    ${lastNode} --> Agents${nodeId}\n`;
			lastNode = `Agents${nodeId}`;
			nodeId++;
		}
	}

	// Workflow phases or Instructions
	if (workflowMatch) {
		const phases = Array.from(
			workflowMatch[1].matchAll(/<phase[^>]*label="([^"]+)"/g),
		);
		phases.forEach((phase, idx) => {
			mermaid += `    Phase${nodeId}["Phase ${idx + 1}: ${phase[1]}"]\n`;
			mermaid += `    ${lastNode} --> Phase${nodeId}\n`;
			lastNode = `Phase${nodeId}`;
			nodeId++;
		});
	} else if (instructionsMatch) {
		// Parse numbered instructions
		const instructions = instructionsMatch[1].trim().split(/\n\s*\d+\.\s+/);
		instructions.slice(1, 4).forEach((instruction, idx) => {
			const cleanInstruction = instruction.trim().substring(0, 35);
			mermaid += `    Step${nodeId}["${idx + 1}. ${cleanInstruction}..."]\n`;
			mermaid += `    ${lastNode} --> Step${nodeId}\n`;
			lastNode = `Step${nodeId}`;
			nodeId++;
		});
	}

	// End node
	mermaid += `    End([Generate])\n`;
	mermaid += `    ${lastNode} --> End\n`;

	// Style nodes
	mermaid += `    classDef roleClass fill:#3b82f6,stroke:#2563eb,color:#fff\n`;
	mermaid += `    classDef taskClass fill:#10b981,stroke:#059669,color:#fff\n`;
	mermaid += `    classDef varClass fill:#8b5cf6,stroke:#7c3aed,color:#fff\n`;
	mermaid += `    classDef agentClass fill:#f59e0b,stroke:#d97706,color:#fff\n`;

	if (roleMatch) mermaid += `    class Role0 roleClass\n`;
	if (taskMatch) mermaid += `    class Task1 taskClass\n`;
	if (uniqueVars.length > 0) mermaid += `    class Vars2 varClass\n`;
	if (agentsMatch) mermaid += `    class Agents3 agentClass\n`;

	return mermaid;
};

export function PromptFlowchartPreview({
	promptValue,
	disabled = false,
	className = "",
}: PromptFlowchartPreviewProps) {
	const svgRef = useRef<HTMLDivElement>(null);

	// Generate mermaid chart
	const mermaidCode = parsePOMLToMermaid(promptValue);

	useEffect(() => {
		if (!mermaidCode || !svgRef.current) return;

		// Dynamically load mermaid
		import("mermaid").then((mermaid) => {
			mermaid.default.initialize({
				startOnLoad: false,
				theme: "dark",
				themeVariables: {
					fontSize: "12px",
				},
			});

			// Render mermaid
			const id = `mermaid-${Date.now()}`;
			mermaid.default.render(id, mermaidCode).then(({ svg }) => {
				if (svgRef.current) {
					svgRef.current.innerHTML = svg;
				}
			});
		});
	}, [mermaidCode]);

	if (disabled || !promptValue.trim()) {
		return (
			<Eye
				className={cn(
					"h-4 w-4 text-muted-foreground/30 cursor-not-allowed",
					className,
				)}
			/>
		);
	}

	return (
		<TooltipProvider delayDuration={200}>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						className={cn(
							"inline-flex items-center justify-center hover:text-primary transition-colors",
							className,
						)}
					>
						<Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
					</button>
				</TooltipTrigger>
				<TooltipContent
					side="left"
					align="start"
					className="w-[400px] max-h-[500px] p-4 overflow-auto"
				>
					<div className="space-y-2">
						<h4 className="text-xs font-semibold text-foreground mb-2">
							Prompt Flowchart Preview
						</h4>
						<div
							ref={svgRef}
							className="rounded-md bg-muted/30 p-2 overflow-auto max-h-[400px]"
						/>
						<p className="text-[10px] text-muted-foreground mt-2">
							Visual representation of your POML prompt structure
						</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
