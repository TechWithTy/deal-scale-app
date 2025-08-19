"use client";
import { KanbanBoard, NewTaskDialog } from "@/external/kanban";
import { useEffect } from "react";
import { useTaskStore } from "@/external/kanban/store";

export default function TestExternalKanbanPage() {
	const { tasks, runAi } = useTaskStore();

	// Auto-sync: any AI-enabled task already in IN_PROGRESS should be set to running
	useEffect(() => {
		for (const t of tasks) {
			if (
				t.status === "IN_PROGRESS" &&
				t.mcpWorkflow &&
				t.aiState !== "running"
			) {
				runAi(String(t.id));
			}
		}
		// Only run on mount and when tasks ref changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">External Kanban Test</h1>
				<NewTaskDialog />
			</div>
			<KanbanBoard />
		</div>
	);
}
