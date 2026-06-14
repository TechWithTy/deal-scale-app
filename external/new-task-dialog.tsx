"use client";

import { Button } from "@/components/ui/button";
import { FilePlus2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import EditTaskDialog from "./kanban/components/EditTaskDialog";

export default function NewTaskDialog() {
	const [openManual, setOpenManual] = useState(false);
	const [openAi, setOpenAi] = useState(false);

	useEffect(() => {
		const openManualTask = () => setOpenManual(true);
		const openAiTask = () => setOpenAi(true);
		const closeTask = () => {
			setOpenManual(false);
			setOpenAi(false);
		};

		window.addEventListener(
			"tour-open-kanban-manual-task-modal",
			openManualTask,
		);
		window.addEventListener("tour-open-kanban-ai-task-modal", openAiTask);
		window.addEventListener("tour-close-kanban-task-modal", closeTask);

		return () => {
			window.removeEventListener(
				"tour-open-kanban-manual-task-modal",
				openManualTask,
			);
			window.removeEventListener("tour-open-kanban-ai-task-modal", openAiTask);
			window.removeEventListener("tour-close-kanban-task-modal", closeTask);
		};
	}, []);

	return (
		<div className="flex items-center gap-2">
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="border-muted-foreground/30 text-foreground hover:bg-muted/40"
				onClick={() => setOpenManual(true)}
				aria-label="Create manual task"
				data-tour="kanban-manual-task-button"
			>
				<span className="inline-flex items-center gap-2">
					<FilePlus2 className="h-4 w-4 opacity-90" />
					Manual Task
				</span>
			</Button>
			<Button
				type="button"
				variant="default"
				size="sm"
				className="bg-violet-600 text-white shadow-sm hover:bg-violet-700 hover:shadow focus-visible:ring-violet-500"
				onClick={() => setOpenAi(true)}
				aria-label="Create AI task"
				data-tour="kanban-ai-task-button"
			>
				<span className="inline-flex items-center gap-2">
					<Sparkles className="h-4 w-4" />
					<span className="font-medium">AI Task</span>
				</span>
			</Button>

			{/* Create Task Dialogs */}
			<EditTaskDialog
				open={openManual}
				onOpenChange={setOpenManual}
				mode="create"
				initialTab="manual"
			/>
			<EditTaskDialog
				open={openAi}
				onOpenChange={setOpenAi}
				mode="create"
				initialTab="ai"
			/>
		</div>
	);
}
