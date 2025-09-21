"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { RefreshCw, Square } from "lucide-react";
import type { KanbanTask } from "../../../utils/types";
import { formatHMS } from "../utils/time";

export type AiBadge = {
	label: string;
	variant: "default" | "secondary" | "destructive" | "outline";
};

export function AiHeaderControls({
	task,
	aiState,
	aiBadge,
	onOpen,
	onCancel,
	onRetry,
}: {
	task: KanbanTask;
	aiState: string | undefined;
	aiBadge: AiBadge;
	onOpen: () => void;
	onCancel?: () => void;
	onRetry?: () => void;
}) {
	const elapsedSeconds = (() => {
		if (!task.aiStartedAt) return 0;
		const start = new Date(task.aiStartedAt).getTime();
		const now = Date.now();
		return Math.max(0, Math.floor((now - start) / 1000));
	})();

	return (
		<div className="ml-2 flex items-center gap-2">
			{aiState !== "running" ? (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="secondary"
								className="mx-0 px-2 py-1 font-bold text-xs"
								type="button"
								onClick={onOpen}
							>
								<span role="img" aria-label="Play">
									▶️
								</span>{" "}
								Ai
							</Button>
						</TooltipTrigger>
						<TooltipContent
							side="top"
							align="center"
							className="min-w-[12rem] max-w-md whitespace-pre-line break-words px-4 py-3 text-center"
						>
							<span className="mb-1 block font-semibold text-primary">
								{task.mcpWorkflow?.title || "AI Workflow"}
							</span>
							<span className="block">
								{task.mcpWorkflow?.prompts?.[0]?.description ||
									"This will run an AI-powered workflow for this task."}
							</span>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			) : (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								className="mx-0 h-8 w-8 p-0"
								aria-label="AI run info"
								type="button"
							>
								<Info className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent
							side="top"
							align="center"
							className="min-w-[14rem] max-w-sm whitespace-pre-line break-words px-4 py-3 text-left"
						>
							<div className="mb-1 flex items-center gap-2 text-primary">
								<span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
								<span className="font-semibold">Running…</span>
							</div>
							<div className="text-sm text-muted-foreground">
								Elapsed: {formatHMS(elapsedSeconds)}
							</div>
							{typeof task.aiEtaSeconds === "number" && (
								<div className="text-sm text-muted-foreground">
									ETA:{" "}
									{formatHMS(Math.max(0, task.aiEtaSeconds - elapsedSeconds))}
								</div>
							)}
							{task.aiStreamText && (
								<div className="mt-2 text-sm">{task.aiStreamText}</div>
							)}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
			{/* Header action buttons for quick access while running/failed */}
			{aiState === "running" && onCancel && (
				<Button
					variant="ghost"
					className="mx-0 h-8 px-2 text-destructive"
					onClick={onCancel}
					type="button"
				>
					<Square className="mr-1 h-3 w-3" />
					Stop
				</Button>
			)}
			{aiState === "failed" && onRetry && (
				<Button
					variant="outline"
					className="mx-0 h-8 px-2"
					onClick={onRetry}
					type="button"
				>
					<RefreshCw className="mr-1 h-3 w-3" />
					Retry
				</Button>
			)}
			<Badge variant={aiBadge.variant as any} className="font-semibold">
				{aiBadge.label}
			</Badge>
		</div>
	);
}
