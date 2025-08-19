"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { KanbanTask } from "./types";
import { useTaskStore } from "./store";

interface AiTaskModalProps {
	task: KanbanTask | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function AiTaskModal({
	task,
	open,
	onOpenChange,
}: AiTaskModalProps) {
	const { setAiPending, runAi } = useTaskStore();

	const [leadId, setLeadId] = useState("");
	const [emailTone, setEmailTone] = useState("");
	const [appointmentDate, setAppointmentDate] = useState("");

	const required = useMemo(() => {
		// Minimal required params demo. In real usage, derive from workflow definition.
		return ["leadId", "emailTone", "appointmentDate"] as const;
	}, []);

	const isValid = leadId && emailTone && appointmentDate;

	if (!task) return null;

	const onRun = () => {
		if (!task) return;
		// In a real impl, we'd persist params to the task or pass to executor
		setAiPending(task.id);
		runAi(task.id);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{task.mcpWorkflow?.title ?? "AI Workflow"}</DialogTitle>
					<DialogDescription>
						{task.mcpWorkflow?.prompts?.[0]?.description ??
							"Provide required parameters to start the workflow."}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="leadId" className="text-right">
							Lead ID
						</Label>
						<Input
							id="leadId"
							className="col-span-3"
							value={leadId}
							onChange={(e) => setLeadId(e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="emailTone" className="text-right">
							Email Tone
						</Label>
						<Input
							id="emailTone"
							className="col-span-3"
							value={emailTone}
							onChange={(e) => setEmailTone(e.target.value)}
							placeholder="warm | formal | casual"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="appointmentDate" className="text-right">
							Appointment Date
						</Label>
						<Input
							id="appointmentDate"
							type="date"
							className="col-span-3"
							value={appointmentDate}
							onChange={(e) => setAppointmentDate(e.target.value)}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={onRun} disabled={!isValid}>
						Run
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
