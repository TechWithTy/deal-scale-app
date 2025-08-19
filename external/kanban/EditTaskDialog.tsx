"use client";

import { useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { KanbanTask } from "./types";
import { useTaskStore } from "./store";
import { AssignmentTypeDropdown } from "./new-task-dialog/AssignmentTypeDropdown";
import { LeadDropdown } from "./new-task-dialog/LeadDropdown";
import { LeadListDropdown } from "./new-task-dialog/LeadListDropdown";
import { TeamMemberDropdown } from "./new-task-dialog/TeamMemberDropdown";
import { TaskFormFields } from "./new-task-dialog/TaskFormFields";

interface EditTaskDialogProps {
	task: KanbanTask;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function EditTaskDialog({
	task,
	open,
	onOpenChange,
}: EditTaskDialogProps) {
	const updateTask = useTaskStore((s) => s.updateTask);

	const initialAssignType = useMemo<"lead" | "leadList" | "">(() => {
		if (task.leadId) return "lead";
		if (task.leadListId) return "leadList";
		return "";
	}, [task.leadId, task.leadListId]);

	const [assignType, setAssignType] = useState<"lead" | "leadList" | "">(
		initialAssignType,
	);
	const [selectedLeadId, setSelectedLeadId] = useState<number | null>(
		task.leadId ? Number(task.leadId) : null,
	);
	const [selectedLeadListId, setSelectedLeadListId] = useState<number | null>(
		task.leadListId ? Number(task.leadListId) : null,
	);
	const [assignedUserId, setAssignedUserId] = useState<string>(
		task.assignedToTeamMember || "",
	);
	const [formValid, setFormValid] = useState(true);

	const validateForm = (form: HTMLFormElement) => {
		const formData = new FormData(form);
		const title = formData.get("title") as string | null;
		const description = formData.get("description") as string | null;
		const dueDate = formData.get("dueDate") as string | null;
		if (!title || !description || !dueDate) return false;
		if (assignType === "lead" && !selectedLeadId) return false;
		if (assignType === "leadList" && !selectedLeadListId) return false;
		if (!assignedUserId) return false;
		return true;
	};

	const handleInputChange = (e: React.FormEvent<HTMLFormElement>) => {
		setFormValid(validateForm(e.currentTarget));
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);

		const title = formData.get("title");
		const description = formData.get("description");
		const dueDate = formData.get("dueDate");
		const appointmentDate = formData.get("appointmentDate");
		const appointmentTime = formData.get("appointmentTime");
		const youtubeUrl = formData.get("youtubeUrl");

		if (
			typeof title !== "string" ||
			typeof description !== "string" ||
			typeof dueDate !== "string"
		)
			return;

		const leadId =
			assignType === "lead" && selectedLeadId
				? String(selectedLeadId)
				: undefined;
		const leadListId =
			assignType === "leadList" && selectedLeadListId
				? String(selectedLeadListId)
				: undefined;

		const fileEntries = formData
			.getAll("attachmentFiles")
			.filter((v) => v instanceof File) as File[];
		const limitedFiles = fileEntries.slice(0, 6);
		const attachments =
			limitedFiles.length > 0
				? limitedFiles.map((file) => ({
						filename: file.name,
						url: URL.createObjectURL(file),
					}))
				: undefined;

		updateTask(String(task.id), {
			title,
			description,
			dueDate,
			assignedToTeamMember: assignedUserId || undefined,
			appointmentDate:
				typeof appointmentDate === "string" && appointmentDate.length > 0
					? appointmentDate
					: undefined,
			appointmentTime:
				typeof appointmentTime === "string" && appointmentTime.length > 0
					? appointmentTime
					: undefined,
			leadId,
			leadListId,
			youtubeUrl:
				typeof youtubeUrl === "string" && youtubeUrl.length > 0
					? youtubeUrl
					: undefined,
			attachments,
		});

		onOpenChange(false);
	};

	const initialValues = {
		title: task.title,
		description: task.description || "",
		dueDate: task.dueDate || "",
		appointmentDate: task.appointmentDate,
		appointmentTime: task.appointmentTime,
		youtubeUrl: task.youtubeUrl,
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Task</DialogTitle>
				</DialogHeader>

				<form
					id="edit-task-form"
					className="grid gap-4 py-2"
					onSubmit={handleSubmit}
					onInput={handleInputChange}
					autoComplete="off"
				>
					<AssignmentTypeDropdown
						assignType={assignType}
						setAssignType={setAssignType}
					/>

					{assignType === "lead" && (
						<LeadDropdown
							selectedLeadId={selectedLeadId}
							setSelectedLeadId={setSelectedLeadId}
						/>
					)}

					{assignType === "leadList" && (
						<LeadListDropdown
							selectedLeadListId={selectedLeadListId}
							setSelectedLeadListId={setSelectedLeadListId}
						/>
					)}

					<TeamMemberDropdown
						assignedUserId={assignedUserId}
						setAssignedUserId={setAssignedUserId}
					/>

					<TaskFormFields
						assignType={assignType}
						initialValues={initialValues}
					/>
				</form>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button type="submit" form="edit-task-form" disabled={!formValid}>
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
