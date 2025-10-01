"use client";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "external/kanban/KanbanBoard";
import NewTaskDialog from "external/new-task-dialog";
import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTaskStore } from "external/kanban/utils/store";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import { campaignSteps } from "@/_tests/tours/campaignTour";

export default function TestExternalKanbanPage() {
	const { tasks, runAi } = useTaskStore();
	const [showWalkthrough, setShowWalkthrough] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);

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

	const handleStartTour = () => setIsTourOpen(true);
	const handleCloseTour = () => setIsTourOpen(false);

	return (
		<div className="container mx-auto space-y-6 py-6 relative">
			{/* Question Mark Help Button */}
			<div className="absolute top-0 right-0 z-50">
				<button
					onClick={() => setShowWalkthrough(true)}
					className="rounded-full w-10 h-10 p-0 hover:bg-muted bg-transparent border-none"
				>
					<HelpCircle className="w-5 h-5 text-muted-foreground" />
				</button>
			</div>

			<div className="flex items-center justify-between">
				<h1 className="font-bold text-2xl">External Kanban Test</h1>
				<NewTaskDialog />
			</div>
			<KanbanBoard />

			{/* WalkThrough Modal */}
			<WalkThroughModal
				isOpen={showWalkthrough}
				onClose={() => setShowWalkthrough(false)}
				videoUrl="https://www.youtube.com/watch?v=hyosynoNbSU"
				title="Kanban Board Guide"
				subtitle="Learn how to manage tasks and projects with our AI-powered Kanban board."
				steps={campaignSteps}
				isTourOpen={isTourOpen}
				onStartTour={handleStartTour}
				onCloseTour={handleCloseTour}
			/>
		</div>
	);
}
