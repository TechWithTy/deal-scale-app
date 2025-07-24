"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/lib/stores/taskActions";
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
		const { title, description, dueDate, appointmentDate, appointmentTime } =
			Object.fromEntries(formData);
		if (
			typeof title !== "string" ||
			typeof description !== "string" ||
			typeof dueDate !== "string"
		)
			return;
		const getString = (val: FormDataEntryValue | undefined) =>
			typeof val === "string" ? val : "";
		const assignedToTeamMember = assignedUserId;
		const leadId =
			assignType === "lead" && selectedLeadId ? selectedLeadId : undefined;
		const leadListId =
			assignType === "leadList" && selectedLeadListId
				? selectedLeadListId
				: undefined;
		addTask(
			getString(title),
			getString(description),
			getString(assignedToTeamMember),
			getString(dueDate),
			appointmentTime &&
				typeof appointmentTime === "string" &&
				appointmentTime.length > 0
				? appointmentTime
				: undefined,
			leadId !== undefined ? String(leadId) : undefined,
			leadListId !== undefined ? String(leadListId) : undefined,
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
