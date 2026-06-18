"use client";

import { HelpCircle } from "lucide-react";
import { useState } from "react";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import { ActionsKanbanPanel } from "./actions-kanban-panel";

interface KanbanWorkspaceProps {
	className?: string;
}

export function KanbanWorkspace({ className }: KanbanWorkspaceProps) {
	const [showWalkthrough, setShowWalkthrough] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);

	return (
		<div
			className={
				className ??
				"container relative mx-auto flex min-h-[calc(100vh-8rem)] flex-col py-6"
			}
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
				className="flex min-h-0 flex-1 flex-col"
				data-tour="kanban-board-page"
			>
				<ActionsKanbanPanel className="min-h-full rounded-lg border border-border" />
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
