"use client";

import { ActionsKanbanPanel as LiveAvatarActionsKanbanPanel } from "@/external/interactive-avatar-nextjs-demo/components/kanban/ActionsKanbanPanel";
import { cn } from "@/lib/_utils";

interface ActionsKanbanPanelProps {
	className?: string;
}

export function ActionsKanbanPanel({ className }: ActionsKanbanPanelProps) {
	return (
		<div className={cn("h-full min-h-0", className)}>
			<LiveAvatarActionsKanbanPanel />
		</div>
	);
}
