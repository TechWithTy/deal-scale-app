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
import type { KanbanTask } from "./utils/types";
import { useTaskStore } from "./utils/store";
import { useUserStore } from "@/lib/stores/userStore";

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
	const costType = task?.costType ?? (task?.mcpWorkflow ? "ai" : undefined);
	const costAmount = Math.max(1, task?.costAmount ?? 1);
	const remaining = useUserStore((s) => {
		if (!costType) return 0;
		if (costType === "ai") {
			const c = s.credits.ai;
			return Math.max(0, c.allotted - c.used);
		}
		if (costType === "leads") {
			const c = s.credits.leads;
			return Math.max(0, c.allotted - c.used);
		}
		const c = s.credits.skipTraces;
		return Math.max(0, c.allotted - c.used);
	});
	const insufficient = costType ? remaining < costAmount : false;
	const costLabel =
		costType === "leads"
			? "Lead"
			: costType === "skipTraces"
				? "Skip Trace"
				: "AI";

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
		if (insufficient) return;
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
					{costType && (
						<div className="rounded-md border bg-muted/40 px-3 py-2 text-muted-foreground text-xs">
							Cost: {costAmount} {costLabel}{" "}
							{costAmount === 1 ? "credit" : "credits"} · Remaining: {remaining}
						</div>
					)}
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
					<Button
						onClick={onRun}
						disabled={!isValid || insufficient}
						title={insufficient ? `Not enough ${costLabel} credits` : undefined}
					>
						Run
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
