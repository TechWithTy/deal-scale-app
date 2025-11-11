"use client";
import { KanbanBoard, NewTaskDialog } from "external/kanban";
import { useTaskStore } from "external/kanban/utils/store";
import { useEffect } from "react";

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
	}, [runAi, tasks]); // Add both dependencies here
	return (
		<div className="container mx-auto space-y-6 py-6">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-2xl">External Kanban Test</h1>
				<NewTaskDialog />
			</div>
			<KanbanBoard />
		</div>
	);
}
