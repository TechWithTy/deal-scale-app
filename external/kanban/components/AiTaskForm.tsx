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

// Supported agent types
const AGENT_TYPES = [
	{ value: "text", label: "Text" },
	{ value: "voice", label: "Voice" },
	{ value: "social", label: "Social" },
	{ value: "direct_mail", label: "Direct Mail" },
] as const;

type AgentType = (typeof AGENT_TYPES)[number]["value"];

interface AiTaskFormProps {
	onCreated?: () => void;
}

export default function AiTaskForm({ onCreated }: AiTaskFormProps) {
	const addTask = useTaskStore((s) => s.addTask);

	const [agentType, setAgentType] = useState<AgentType>("text");
	const [assignType, setAssignType] = useState<"lead" | "leadList">("lead");
	const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
	const [selectedLeadListId, setSelectedLeadListId] = useState<string | null>(
		null,
	);
	const [assignedUserId, setAssignedUserId] = useState<string>("");

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [scheduledDate, setScheduledDate] = useState<string>("");
	// Default timezone to user's local IANA timezone
	const localTz = useMemo(() => {
		try {
			return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
		} catch {
			return "UTC";
		}
	}, []);
	const [scheduledTimezone, setScheduledTimezone] = useState<string>(localTz);
	const [youtubeUrl, setYoutubeUrl] = useState<string | undefined>();
	const [attachmentUrl, setAttachmentUrl] = useState<string>("");
	const [attachments, setAttachments] = useState<
		{ filename: string; url: string }[]
	>([]);

	const [preview, setPreview] = useState("");

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

	const buildMcpSnippet = () => {
		const leadRef =
			assignType === "lead"
				? `leadId: ${selectedLeadId}`
				: `leadListId: ${selectedLeadListId}`;
		const safeDesc = description || title;

		switch (agentType) {
			case "text":
				return `// Suggested MCP tool call\n[MCP:sms.send({ ${leadRef}, message: \"${safeDesc}\" })]`;
			case "voice":
				return `// Suggested MCP tool call\n[MCP:voice.call({ ${leadRef}, script: \"${safeDesc}\" })]`;
			case "social":
				return `// Suggested MCP tool call\n[MCP:social.post({ ${leadRef}, content: \"${safeDesc}\" })]`;
			case "direct_mail":
				return `// Suggested MCP tool call\n[MCP:mail.send({ ${leadRef}, template: \"Outreach\", note: \"${safeDesc}\" })]`;
			default:
				return "";
		}
	};

	const handleGenerate = (e: React.FormEvent) => {
		e.preventDefault();
		const agentLabel =
			AGENT_TYPES.find((a) => a.value === agentType)?.label ?? "Agent";
		const target =
			assignType === "lead"
				? `Lead ${selectedLeadId ?? "(not selected)"}`
				: `Lead List ${selectedLeadListId ?? "(not selected)"}`;

		const maybeSched = scheduledDate
			? `\nScheduled: ${scheduledDate} (${scheduledTimezone || "UTC"})`
			: "";
		const base =
			`Agent: ${agentLabel}\nTarget: ${target}\nTitle: ${title}\nDue: ${dueDate}${maybeSched}\n\n${description || ""}`.trim();
		const mcp = buildMcpSnippet();

		const combined = `${base}\n\n${mcp}`;
		setPreview(combined);
	};

	const handleCreateFromPreview = () => {
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
			// Use preview as the final description so MCP snippet is preserved/editable in task
			preview || description,
			assignedUserId,
			dueDate,
			scheduledDate || undefined,
			scheduledTimezone || undefined,
			undefined, // appointmentDate
			undefined, // appointmentTime
			undefined, // appointmentTimezone
			leadId,
			leadListId,
			youtubeUrl,
			undefined, // outputVideoUrl
			attachments,
		);

		// Reset
		setPreview("");
		setTitle("");
		setDescription("");
		setDueDate("");
		setScheduledDate("");
		setScheduledTimezone(localTz);
		setYoutubeUrl(undefined);
		setAttachments([]);

		onCreated?.();
	};

	return (
		<form className="grid gap-4" onSubmit={handleGenerate}>
			<div className="grid gap-2">
				<Label htmlFor="agent">Agent Type</Label>
				<select
					id="agent"
					className="h-9 rounded-md border bg-background px-3 text-sm"
					value={agentType}
					onChange={(e) => setAgentType(e.target.value as AgentType)}
				>
					{AGENT_TYPES.map((a) => (
						<option key={a.value} value={a.value}>
							{a.label}
						</option>
					))}
				</select>
			</div>

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
				<Label htmlFor="scheduled">Scheduled Date & Time (optional)</Label>
				<div className="flex gap-2">
					<Input
						id="scheduled"
						type="datetime-local"
						value={scheduledDate}
						onChange={(e) => setScheduledDate(e.target.value)}
					/>
					<select
						id="scheduledTimezone"
						className="h-9 rounded-md border bg-background px-3 text-sm"
						value={scheduledTimezone}
						onChange={(e) => setScheduledTimezone(e.target.value)}
						aria-label="Timezone"
					>
						{/* Prefer local timezone, then a short curated list */}
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
				<Label>Assets / Attachments (optional)</Label>
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
					<ul className="list-disc pl-5 text-sm text-muted-foreground">
						{attachments.map((a) => (
							<li key={a.url}>{a.filename}</li>
						))}
					</ul>
				)}
			</div>

			<div className="pt-2 flex gap-2">
				<Button type="submit" disabled={!formValid}>
					Generate Task Preview
				</Button>
				<Button
					type="button"
					variant="outline"
					disabled={!preview}
					onClick={handleCreateFromPreview}
				>
					Create Task From Preview
				</Button>
			</div>

			{preview && (
				<div className="rounded-md border bg-muted/40 p-4">
					<div className="mb-2 text-sm font-medium">
						Editable Preview with MCP calls highlighted
					</div>
					<Textarea
						className="font-mono text-sm"
						value={preview}
						onChange={(e) => setPreview(e.target.value)}
						rows={10}
					/>
					<div className="mt-2 text-xs text-muted-foreground">
						Tip: Edit the content above. Parts like [MCP:...] indicate suggested
						tool calls.
					</div>
				</div>
			)}
		</form>
	);
}
