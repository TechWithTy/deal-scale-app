"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import EditTaskDialog from "./kanban/components/EditTaskDialog";
import { Sparkles, FilePlus2 } from "lucide-react";

export default function NewTaskDialog() {
	const [openManual, setOpenManual] = useState(false);
	const [openAi, setOpenAi] = useState(false);

	return (
		<div className="flex items-center gap-2">
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="border-muted-foreground/30 text-foreground hover:bg-muted/40"
				onClick={() => setOpenManual(true)}
				aria-label="Create manual task"
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
				className="bg-violet-600 text-white hover:bg-violet-700 shadow-sm hover:shadow focus-visible:ring-violet-500"
				onClick={() => setOpenAi(true)}
				aria-label="Create AI task"
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
