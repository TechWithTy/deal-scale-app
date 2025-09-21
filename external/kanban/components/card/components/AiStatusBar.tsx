"use client";

import { Button } from "@/components/ui/button";
import type { KanbanTask } from "../../../utils/types";
import { useUserStore } from "@/lib/stores/userStore";
import { AlertTriangle, RefreshCw, XCircle } from "lucide-react";

export function AiStatusBar({
	task,
	aiState,
	onRun,
	onCancel,
	onRetry,
	onResolveOAuth,
	onProvide,
}: {
	task: KanbanTask;
	aiState?: string;
	onRun: () => void;
	onCancel: () => void;
	onRetry: () => void;
	onResolveOAuth: () => void;
	onProvide: () => void;
}) {
	if (!task.mcpWorkflow) return null;
	const costType = task.costType ?? (task.mcpWorkflow ? "ai" : undefined);
	const costAmount =
		typeof task.costAmount === "number" ? task.costAmount : 0.25;
	const remaining = useUserStore((s) => {
		if (!costType) return 0;
		if (costType === "ai") {
			const c = s.credits.ai;
			return Math.max(0, c.allotted - c.used);
		}
		if (costType === "leads") {
			const c = s.credits.leads;
			return Math.max(0, c.allotted - c.used);
		}
		const c = s.credits.skipTraces;
		return Math.max(0, c.allotted - c.used);
	});
	const insufficient = costType ? remaining < costAmount : false;
	const costLabel =
		costType === "leads"
			? "Lead"
			: costType === "skipTraces"
				? "Skip Trace"
				: "AI";
	return (
		<div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
			{aiState === "running" && (
				<Button size="sm" variant="ghost" onClick={onCancel}>
					Cancel
				</Button>
			)}

			{aiState === "failed" && (
				<div className="inline-flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 px-2 py-1 text-destructive">
					<XCircle className="h-4 w-4" />
					<span>{task.aiErrorMessage || "Workflow failed"}</span>
					<Button
						size="sm"
						className="ml-2 inline-flex h-7 items-center gap-1 px-2"
						onClick={onRetry}
					>
						<RefreshCw className="h-3 w-3 shrink-0" />
						<span>Retry</span>
					</Button>
				</div>
			)}

			{aiState === "blocked" && (
				<div className="inline-flex items-center gap-2 rounded border border-amber-400/40 bg-amber-50 px-2 py-1 text-amber-700">
					<AlertTriangle className="h-4 w-4" />
					<span>
						Missing:{" "}
						{(task.aiMissingParams || []).join(", ") || "required parameters"}
					</span>
					<Button
						size="sm"
						variant="outline"
						className="ml-2 h-7 px-2"
						onClick={onProvide}
					>
						Provide
					</Button>
					<Button
						size="sm"
						className="ml-1 inline-flex h-7 items-center gap-1 px-2"
						onClick={onRetry}
					>
						<RefreshCw className="h-3 w-3 shrink-0" />
						<span>Retry</span>
					</Button>
				</div>
			)}

			{aiState === "requires_oauth" && (
				<div className="inline-flex items-center gap-2 rounded border border-amber-400/40 bg-amber-50 px-2 py-1 text-amber-700">
					<AlertTriangle className="h-4 w-4" />
					<span>Authorization required</span>
					<Button
						size="sm"
						variant="outline"
						className="ml-2 h-7 px-2"
						onClick={onResolveOAuth}
					>
						Connect
					</Button>
					<Button
						size="sm"
						className="ml-1 inline-flex h-7 items-center gap-1 px-2"
						onClick={onRetry}
					>
						<RefreshCw className="h-3 w-3 shrink-0" />
						<span>Retry</span>
					</Button>
				</div>
			)}

			{(aiState === "pending" || aiState === undefined) && (
				<div className="inline-flex items-center gap-2">
					<Button
						size="sm"
						onClick={onRun}
						disabled={insufficient}
						title={insufficient ? `Not enough ${costLabel} credits` : undefined}
					>
						Run
					</Button>
					{costType && (
						<span className="rounded border bg-muted px-2 py-0.5 text-muted-foreground text-xs">
							Cost: {costAmount} {costLabel}{" "}
							{costAmount === 1 ? "credit" : "credits"} · Remaining: {remaining}
						</span>
					)}
				</div>
			)}
		</div>
	);
}
