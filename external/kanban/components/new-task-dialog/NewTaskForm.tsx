"use client";

import { useState } from "react";
import { CreateKanbanTaskSchema } from "../../utils/schema";
import { useTaskStore } from "../../utils/store";
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
	const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
	const [selectedLeadListId, setSelectedLeadListId] = useState<string | null>(
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
			scheduledDate,
			scheduledTimezone,
			appointmentDateTime,
			appointmentTimezone,
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
		// Split combined appointmentDateTime into date/time parts
		const apptDateStr =
			typeof appointmentDateTime === "string" && appointmentDateTime.length > 0
				? appointmentDateTime.split("T")[0]
				: undefined;
		const apptTimeStr =
			typeof appointmentDateTime === "string" && appointmentDateTime.length > 0
				? (appointmentDateTime.split("T")[1] || "").slice(0, 5)
				: undefined;

		const candidate = {
			title: getString(title),
			description: getString(description),
			status: "TODO",
			assignedToTeamMember: assignedUserId || undefined,
			dueDate: getString(dueDate),
			scheduledDate:
				typeof scheduledDate === "string" && scheduledDate.length > 0
					? scheduledDate
					: undefined,
			appointmentDate: apptDateStr,
			appointmentTime: apptTimeStr,
			appointmentTimezone:
				typeof appointmentTimezone === "string" &&
				appointmentTimezone.length > 0
					? appointmentTimezone
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
			parsed.data.scheduledDate,
			typeof scheduledTimezone === "string" && scheduledTimezone.length > 0
				? scheduledTimezone
				: undefined,
			parsed.data.appointmentDate,
			parsed.data.appointmentTime,
			parsed.data.appointmentTimezone,
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
