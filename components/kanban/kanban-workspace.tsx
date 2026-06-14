"use client";

import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import { KanbanBoard } from "@/external/kanban/KanbanBoard";
import { useTaskStore } from "@/lib/stores/taskActions";
import NewTaskDialog from "external/new-task-dialog";

interface KanbanWorkspaceProps {
	className?: string;
}

export function KanbanWorkspace({ className }: KanbanWorkspaceProps) {
	const { tasks, runAi } = useTaskStore();
	const [showWalkthrough, setShowWalkthrough] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);

	useEffect(() => {
		for (const task of tasks) {
			if (
				task.status === "IN_PROGRESS" &&
				task.mcpWorkflow &&
				task.aiState !== "running"
			) {
				runAi(String(task.id));
			}
		}
	}, [runAi, tasks]);

	return (
		<div
			className={className ?? "container relative mx-auto space-y-6 py-6"}
			data-tour="kanban-page"
		>
			<div className="absolute top-0 right-0 z-50">
				<button
					type="button"
					onClick={() => setShowWalkthrough(true)}
					className="h-10 w-10 rounded-full border-none bg-transparent p-0 hover:bg-muted"
				>
					<HelpCircle className="h-5 w-5 text-muted-foreground" />
				</button>
			</div>

			<div
				className="flex items-center justify-between"
				data-tour="kanban-header"
			>
				<h1 className="font-bold text-2xl">Actions Kanban</h1>
				<div data-tour="kanban-new-task">
					<NewTaskDialog />
				</div>
			</div>
			<div data-tour="kanban-board-page">
				<KanbanBoard />
			</div>

			<WalkThroughModal
				isOpen={showWalkthrough}
				onClose={() => setShowWalkthrough(false)}
				videoUrl="https://www.youtube.com/watch?v=hyosynoNbSU"
				title="Kanban Board Guide"
				subtitle="Learn how to manage tasks and projects with our AI-powered Kanban board."
				steps={campaignSteps}
				isTourOpen={isTourOpen}
				onStartTour={() => setIsTourOpen(true)}
				onCloseTour={() => setIsTourOpen(false)}
			/>
		</div>
	);
}
