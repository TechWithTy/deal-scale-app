"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AssignmentTypeDropdown } from "./new-task-dialog/AssignmentTypeDropdown";
import { LeadDropdown } from "./new-task-dialog/LeadDropdown";
import { LeadListDropdown } from "./new-task-dialog/LeadListDropdown";
import { TeamMemberDropdown } from "./new-task-dialog/TeamMemberDropdown";
import { useTaskStore } from "../utils/store";

interface ManualTaskFormProps {
	onCreated?: () => void;
}

export default function ManualTaskForm({ onCreated }: ManualTaskFormProps) {
	const addTask = useTaskStore((s) => s.addTask);

	const [assignType, setAssignType] = useState<"lead" | "leadList">("lead");
	const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
	const [selectedLeadListId, setSelectedLeadListId] = useState<string | null>(
		null,
	);
	const [assignedUserId, setAssignedUserId] = useState<string>("");

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [appointmentDate, setAppointmentDate] = useState<string | undefined>();
	const [appointmentTime, setAppointmentTime] = useState<string | undefined>();
	// Default timezone to user's local IANA timezone
	const localTz = useMemo(() => {
		try {
			return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
		} catch {
			return "UTC";
		}
	}, []);
	const [appointmentTimezone, setAppointmentTimezone] =
		useState<string>(localTz);
	const [youtubeUrl, setYoutubeUrl] = useState<string | undefined>();
	const [attachmentUrl, setAttachmentUrl] = useState<string>("");
	const [attachments, setAttachments] = useState<
		{ filename: string; url: string }[]
	>([]);

	const formValid = useMemo(() => {
		if (!title.trim()) return false;
		if (!dueDate.trim()) return false;
		if (assignType === "lead" && !selectedLeadId) return false;
		if (assignType === "leadList" && !selectedLeadListId) return false;
		return true;
	}, [title, dueDate, assignType, selectedLeadId, selectedLeadListId]);

	const handleAddAttachment = () => {
		const u = attachmentUrl.trim();
		if (!u) return;
		const filename = u.split("/").pop() || "asset";
		setAttachments((prev) => [...prev, { filename, url: u }]);
		setAttachmentUrl("");
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const leadId =
			assignType === "lead" && selectedLeadId != null
				? String(selectedLeadId)
				: undefined;
		const leadListId =
			assignType === "leadList" && selectedLeadListId != null
				? String(selectedLeadListId)
				: undefined;

		addTask(
			title,
			description,
			assignedUserId,
			dueDate,
			undefined, // scheduledDate
			undefined, // scheduledTimezone
			appointmentDate,
			appointmentTime,
			appointmentTimezone || undefined,
			leadId,
			leadListId,
			youtubeUrl,
			undefined,
			attachments,
		);

		// Reset minimal fields
		setTitle("");
		setDescription("");
		setDueDate("");
		setYoutubeUrl(undefined);
		setAttachments([]);

		onCreated?.();
	};

	return (
		<form onSubmit={handleSubmit} className="grid gap-4">
			<AssignmentTypeDropdown
				assignType={assignType}
				setAssignType={setAssignType}
			/>

			{assignType === "lead" && (
				<LeadDropdown
					selectedLeadId={selectedLeadId}
					setSelectedLeadId={(id: string) => setSelectedLeadId(id)}
				/>
			)}

			{assignType === "leadList" && (
				<LeadListDropdown
					selectedLeadListId={selectedLeadListId}
					setSelectedLeadListId={(id: string) => setSelectedLeadListId(id)}
				/>
			)}

			<TeamMemberDropdown
				assignedUserId={assignedUserId}
				setAssignedUserId={setAssignedUserId}
			/>

			<Separator />

			<div className="grid gap-3">
				<Label htmlFor="title">Todo Title</Label>
				<Input
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Enter title"
				/>
			</div>

			<div className="grid gap-3">
				<Label htmlFor="due">Due Date</Label>
				<Input
					id="due"
					type="date"
					value={dueDate}
					onChange={(e) => setDueDate(e.target.value)}
				/>
			</div>

			<div className="grid gap-3">
				<Label htmlFor="appt-date">Appointment Date (optional)</Label>
				<Input
					id="appt-date"
					type="date"
					value={appointmentDate || ""}
					onChange={(e) => setAppointmentDate(e.target.value || undefined)}
				/>
			</div>

			<div className="grid gap-3">
				<Label htmlFor="appt-time">Appointment Time (optional)</Label>
				<Input
					id="appt-time"
					type="time"
					value={appointmentTime || ""}
					onChange={(e) => setAppointmentTime(e.target.value || undefined)}
				/>
			</div>

			<div className="grid gap-3">
				<Label htmlFor="appt-tz">Appointment Timezone (optional)</Label>
				<select
					id="appt-tz"
					className="h-9 rounded-md border bg-background px-3 text-sm"
					value={appointmentTimezone}
					onChange={(e) => setAppointmentTimezone(e.target.value)}
					aria-label="Appointment Timezone"
				>
					<option value={localTz}>{localTz} (local)</option>
					<option value="UTC">UTC</option>
					<option value="America/Los_Angeles">America/Los_Angeles</option>
					<option value="America/Denver">America/Denver</option>
					<option value="America/Chicago">America/Chicago</option>
					<option value="America/New_York">America/New_York</option>
					<option value="Europe/London">Europe/London</option>
					<option value="Europe/Berlin">Europe/Berlin</option>
					<option value="Asia/Tokyo">Asia/Tokyo</option>
					<option value="Asia/Kolkata">Asia/Kolkata</option>
					<option value="Australia/Sydney">Australia/Sydney</option>
				</select>
			</div>

			<div className="grid gap-3">
				<Label htmlFor="desc">Description</Label>
				<Textarea
					id="desc"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
			</div>

			<div className="grid gap-3">
				<Label htmlFor="yt">YouTube URL (optional)</Label>
				<Input
					id="yt"
					value={youtubeUrl || ""}
					onChange={(e) => setYoutubeUrl(e.target.value || undefined)}
				/>
			</div>

			<div className="grid gap-2">
				<Label>Attachments (optional)</Label>
				<div className="flex gap-2">
					<Input
						placeholder="https://..."
						value={attachmentUrl}
						onChange={(e) => setAttachmentUrl(e.target.value)}
					/>
					<Button
						type="button"
						variant="secondary"
						onClick={handleAddAttachment}
					>
						Add
					</Button>
				</div>
				{attachments.length > 0 && (
					<ul className="list-disc pl-5 text-muted-foreground text-sm">
						{attachments.map((a) => (
							<li key={a.url}>{a.filename}</li>
						))}
					</ul>
				)}
			</div>

			<div className="pt-2">
				<Button type="submit" disabled={!formValid}>
					Create Task
				</Button>
			</div>
		</form>
	);
}
