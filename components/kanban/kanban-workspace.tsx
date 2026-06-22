"use client";

import { ActionsKanbanPanel } from "./actions-kanban-panel";

interface KanbanWorkspaceProps {
	className?: string;
}

export function KanbanWorkspace({ className }: KanbanWorkspaceProps) {
	return (
		<div
			className={
				className ??
				"container relative mx-auto flex min-h-[calc(100vh-8rem)] flex-col py-6"
			}
			data-tour="kanban-page"
		>
			<div
				className="flex min-h-0 flex-1 flex-col"
				data-tour="kanban-board-page"
			>
				<ActionsKanbanPanel className="min-h-full rounded-lg border border-border" />
			</div>
		</div>
	);
}
