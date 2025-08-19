"use client";

import { useState } from "react";
import { CreateKanbanTaskSchema } from "@/types/zod/kanban-task";
import { useTaskStore } from "../store";
import { AssignmentTypeDropdown } from "./AssignmentTypeDropdown";
import { LeadDropdown } from "./LeadDropdown";
import { LeadListDropdown } from "./LeadListDropdown";
import { TeamMemberDropdown } from "./TeamMemberDropdown";
import { TaskFormFields } from "./TaskFormFields";

interface NewTaskFormProps {
	setFormValid: (isValid: boolean) => void;
}

export function NewTaskForm({ setFormValid }: NewTaskFormProps) {
	const addTask = useTaskStore((state) => state.addTask);
	const [assignType, setAssignType] = useState<"lead" | "leadList" | "">("");
	const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
	const [selectedLeadListId, setSelectedLeadListId] = useState<number | null>(
		null,
	);
	const [assignedUserId, setAssignedUserId] = useState<string>("");

	const validateForm = (form: HTMLFormElement) => {
		const formData = new FormData(form);
		const title = formData.get("title") as string | null;
		const description = formData.get("description") as string | null;
		const dueDate = formData.get("dueDate") as string | null;
		if (!title || !description || !dueDate) return false;
		if (!assignType) return false;
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
		const {
			title,
			description,
			dueDate,
			appointmentDate,
			appointmentTime,
			youtubeUrl,
		} = Object.fromEntries(formData);
		if (
			typeof title !== "string" ||
			typeof description !== "string" ||
			typeof dueDate !== "string"
		)
			return;

		const getString = (val: FormDataEntryValue | undefined) =>
			typeof val === "string" ? val : "";

		const leadId =
			assignType === "lead" && selectedLeadId
				? String(selectedLeadId)
				: undefined;
		const leadListId =
			assignType === "leadList" && selectedLeadListId
				? String(selectedLeadListId)
				: undefined;

		// Build attachments from selected files (cap at 6)
		const fileEntries = formData
			.getAll("attachmentFiles")
			.filter((v) => v instanceof File) as File[];
		const limitedFiles = fileEntries.slice(0, 6);
		const attachments = limitedFiles.length
			? limitedFiles.map((file) => ({
					filename: file.name,
					url: URL.createObjectURL(file),
				}))
			: undefined;

		// Build candidate payload for validation
		const candidate = {
			title: getString(title),
			description: getString(description),
			status: "TODO",
			assignedToTeamMember: assignedUserId || undefined,
			dueDate: getString(dueDate),
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
			// Hide outputVideoUrl in UI; keep undefined in payload for now
			outputVideoUrl: undefined,
			attachments,
		};

		const parsed = CreateKanbanTaskSchema.safeParse(candidate);
		if (!parsed.success) {
			console.error("Task validation failed", parsed.error.flatten());
			return;
		}

		addTask(
			parsed.data.title,
			parsed.data.description ?? "",
			parsed.data.assignedToTeamMember ?? "",
			parsed.data.dueDate ?? "",
			parsed.data.appointmentDate,
			parsed.data.appointmentTime,
			parsed.data.leadId,
			parsed.data.leadListId,
			parsed.data.youtubeUrl,
			parsed.data.outputVideoUrl,
			parsed.data.attachments,
		);
	};

	return (
		<form
			id="todo-form"
			className="grid gap-4 py-4"
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

			<TaskFormFields assignType={assignType} />
		</form>
	);
}
