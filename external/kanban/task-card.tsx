"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { KanbanTask } from "./types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import {
	GripVertical,
	Info,
	Paperclip,
	Download,
	Youtube,
	AlertTriangle,
	XCircle,
	RefreshCw,
	MoreVertical,
	Pencil,
	Trash,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockGeneratedLeads, mockLeadListData, mockTeamMembers } from "./mocks";
import { useTaskStore } from "./store";
import AiTaskModal from "./AiTaskModal";
import { Confetti } from "@/components/magicui/confetti";
import EditTaskDialog from "./EditTaskDialog";

const priorityBadgeVariant = {
	low: "outline",
	medium: "default",
	high: "destructive",
} as const;

interface TaskCardProps {
	task: KanbanTask;
	isOverlay?: boolean;
}

export type TaskType = "Task";
export interface TaskDragData {
	type: TaskType;
	task: KanbanTask;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
	const showAppointment =
		(!!task.appointmentDate || !!task.appointmentTime) &&
		!!task.leadId &&
		!task.leadListId;
	const [assignedTeamMember, setAssignedTeamMember] = useState(
		task.assignedToTeamMember || "",
	);
	const [aiOpen, setAiOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const prevStatus = useRef(task.status);
	const confettiKey = useMemo(() => `kanban_confetti_${task.id}`, [task.id]);

	const {
		runAi,
		retryAi,
		cancelAi,
		requireOAuth,
		resolveOAuth,
		setAiBlocked,
		removeTask,
	} = useTaskStore();

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: { type: "Task", task } satisfies TaskDragData,
		attributes: { roleDescription: "Task" },
	});

	const style = { transition, transform: CSS.Translate.toString(transform) };

	const variants = cva("", {
		variants: {
			dragging: { over: "ring-2 opacity-30", overlay: "ring-2 ring-primary" },
		},
	});

	const handleAssign = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedTeamMemberId = e.target.value;
		setAssignedTeamMember(selectedTeamMemberId);
		task.assignedToTeamMember = selectedTeamMemberId;
	};

	const aiState = task.aiState || "pending";
	// Ticking clock while running to update elapsed/ETA in tooltip
	const [tick, setTick] = useState(0);
	useEffect(() => {
		if (aiState !== "running") return;
		const id = setInterval(() => setTick((t) => t + 1), 1000);
		return () => clearInterval(id);
	}, [aiState]);
	const elapsedSeconds = useMemo(() => {
		if (!task.aiStartedAt) return 0;
		const start = new Date(task.aiStartedAt).getTime();
		const now = Date.now();
		return Math.max(0, Math.floor((now - start) / 1000));
	}, [task.aiStartedAt, aiState, tick]);
	const formatHMS = (s: number) => {
		const m = Math.floor(s / 60)
			.toString()
			.padStart(2, "0");
		const ss = (s % 60).toString().padStart(2, "0");
		return `${m}:${ss}`;
	};
	const aiBadge = useMemo(() => {
		switch (aiState) {
			case "running":
				return { label: "AI • Running", variant: "default" as const };
			case "success":
				return { label: "AI • Success", variant: "secondary" as const };
			case "failed":
				return { label: "AI • Failed", variant: "destructive" as const };
			case "blocked":
				return { label: "AI • Blocked", variant: "outline" as const };
			case "requires_oauth":
				return { label: "AI • Connect", variant: "outline" as const };
			case "pending":
			default:
				return { label: "AI • Pending", variant: "outline" as const };
		}
	}, [aiState]);

	const assignedLead = Array.isArray(mockGeneratedLeads)
		? mockGeneratedLeads.find((lead) => String(lead.id) === String(task.leadId))
		: undefined;

	// Trigger confetti when status transitions into DONE
	useEffect(() => {
		const was = prevStatus.current;
		const now = task.status;
		if (was !== "DONE" && now === "DONE") {
			// Respect reduced motion
			if (
				typeof window !== "undefined" &&
				window.matchMedia &&
				window.matchMedia("(prefers-reduced-motion: reduce)").matches
			) {
				prevStatus.current = now;
				try {
					localStorage.setItem(confettiKey, "1");
				} catch {}
				return;
			}
			setShowConfetti(true);
			const t = setTimeout(() => setShowConfetti(false), 1200);
			try {
				localStorage.setItem(confettiKey, "1");
			} catch {}
			return () => clearTimeout(t);
		}
		prevStatus.current = now;
	}, [task.status, confettiKey]);

	// On first view of a task already in DONE, show confetti once (then remember)
	useEffect(() => {
		if (task.status !== "DONE") return;
		let alreadyShown = false;
		try {
			alreadyShown = localStorage.getItem(confettiKey) === "1";
		} catch {}
		if (!alreadyShown) {
			if (
				typeof window !== "undefined" &&
				window.matchMedia &&
				window.matchMedia("(prefers-reduced-motion: reduce)").matches
			) {
				try {
					localStorage.setItem(confettiKey, "1");
				} catch {}
				return;
			}
			setShowConfetti(true);
			const t = setTimeout(() => setShowConfetti(false), 1200);
			try {
				localStorage.setItem(confettiKey, "1");
			} catch {}
			return () => clearTimeout(t);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<TooltipProvider>
			<Card
				ref={setNodeRef}
				style={style}
				className={`${variants({ dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined })} relative`}
			>
				<CardHeader className="space-between relative flex flex-row border-secondary border-b-2 px-3 py-3">
					<Button
						variant={"ghost"}
						{...attributes}
						{...listeners}
						className="-ml-2 h-auto cursor-grab p-1 text-secondary-foreground/50"
					>
						<span className="sr-only">Move task</span>
						<GripVertical />
					</Button>
					<Badge variant={"outline"} className="ml-auto font-semibold">
						Task
					</Badge>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="ml-1 h-8 w-8">
								<MoreVertical className="h-4 w-4" />
								<span className="sr-only">Open quick actions</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-36">
							<DropdownMenuItem onClick={() => setEditOpen(true)}>
								<Pencil className="mr-2 h-4 w-4" /> Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => removeTask(String(task.id))}
							>
								<Trash className="mr-2 h-4 w-4" /> Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					{task.mcpWorkflow && (
						<div className="ml-2 flex items-center gap-2">
							{aiState !== "running" ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="secondary"
											className="mx-0 px-2 py-1 font-bold text-xs"
											onClick={() => setAiOpen(true)}
										>
											<span role="img" aria-label="Play">
												▶️
											</span>{" "}
											Ai
										</Button>
									</TooltipTrigger>
									<TooltipContent
										side="top"
										align="center"
										className="min-w-[12rem] max-w-md whitespace-pre-line break-words px-4 py-3 text-center"
									>
										<span className="mb-1 block font-semibold text-primary">
											{task.mcpWorkflow.title || "AI Workflow"}
										</span>
										<span className="block">
											{task.mcpWorkflow.prompts?.[0]?.description ||
												"This will run an AI-powered workflow for this task."}
										</span>
									</TooltipContent>
								</Tooltip>
							) : (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											className="mx-0 h-8 w-8 p-0"
											aria-label="AI run info"
										>
											<Info className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent
										side="top"
										align="center"
										className="min-w-[14rem] max-w-sm whitespace-pre-line break-words px-4 py-3 text-left"
									>
										<div className="mb-1 flex items-center gap-2 text-primary">
											<span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
											<span className="font-semibold">Running…</span>
										</div>
										<div className="text-sm text-muted-foreground">
											Elapsed: {formatHMS(elapsedSeconds)}
										</div>
										{typeof task.aiEtaSeconds === "number" && (
											<div className="text-sm text-muted-foreground">
												ETA:{" "}
												{formatHMS(
													Math.max(0, task.aiEtaSeconds - elapsedSeconds),
												)}
											</div>
										)}
										{task.aiStreamText && (
											<div className="mt-2 text-sm">{task.aiStreamText}</div>
										)}
									</TooltipContent>
								</Tooltip>
							)}
							<Badge variant={aiBadge.variant as any} className="font-semibold">
								{aiBadge.label}
							</Badge>
						</div>
					)}
				</CardHeader>

				<CardContent className="whitespace-pre-wrap px-3 pt-3 pb-6 text-left">
					<div className="font-semibold text-lg">{task.title}</div>
					{task.description && (
						<div className="mt-2 text-muted-foreground text-sm">
							{task.description}
						</div>
					)}

					{task.priority && (
						<div className="mt-2 text-sm">
							<span className="font-semibold">Priority: </span>
							<Badge
								variant={priorityBadgeVariant[task.priority] || "outline"}
								className="ml-2"
							>
								{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
							</Badge>
						</div>
					)}

					{task.dueDate && (
						<div className="mt-2 text-sm">
							<span className="font-semibold">Due Date: </span>
							<span className="text-muted-foreground">{task.dueDate}</span>
						</div>
					)}

					{showAppointment && (
						<div className="mt-2 text-sm">
							<span className="font-semibold">Appointment: </span>
							{task.appointmentDate && (
								<span className="text-muted-foreground">
									{task.appointmentDate}
								</span>
							)}
							{task.appointmentDate && task.appointmentTime && <span> @ </span>}
							{task.appointmentTime && (
								<span className="text-muted-foreground">
									{task.appointmentTime}
								</span>
							)}
						</div>
					)}

					<div className="mt-2 text-sm">
						<span className="my-2 font-semibold">Assigned To: </span>
						<select
							value={assignedTeamMember || ""}
							onChange={handleAssign}
							className="ml-2 rounded border border-gray-300 p-1"
						>
							<option value="" disabled>
								Select team member
							</option>
							{mockTeamMembers.map((member) => (
								<option key={member.id} value={member.id}>
									{`${member.firstName} ${member.lastName}`}
								</option>
							))}
						</select>
					</div>

					{task.leadId ? (
						<div className="mt-2 text-sm">
							<span className="font-semibold">Lead: </span>
							{Array.isArray(mockGeneratedLeads) ? (
								(() => {
									const lead = mockGeneratedLeads.find(
										(l) => String(l.id) === String(task.leadId),
									);
									return lead ? (
										`${lead.contactInfo.firstName} ${lead.contactInfo.lastName}`
									) : (
										<span className="text-gray-400 italic">Lead not found</span>
									);
								})()
							) : (
								<span className="text-gray-400 italic">No lead assigned</span>
							)}
						</div>
					) : task.leadListId ? (
						<div className="mt-2 text-sm">
							<span className="font-semibold">Lead List: </span>
							{Array.isArray(mockLeadListData) ? (
								(() => {
									const leadList = mockLeadListData.find(
										(l) => String(l.id) === String(task.leadListId),
									);
									return leadList ? (
										leadList.listName
									) : (
										<span className="text-gray-400 italic">
											Lead list not found
										</span>
									);
								})()
							) : (
								<span className="text-gray-400 italic">
									No lead list assigned
								</span>
							)}
						</div>
					) : (
						<div className="mt-2 text-sm">
							<span className="text-gray-400 italic">
								No lead or lead list assigned
							</span>
						</div>
					)}

					{Array.isArray(task.attachments) && task.attachments.length > 0 && (
						<div className="mt-3 text-sm">
							<div className="mb-1 font-semibold flex items-center gap-2">
								<Paperclip className="h-4 w-4" /> Attachments
							</div>
							<div className="flex flex-wrap gap-2">
								{task.attachments.map((att) => (
									<a
										key={att.url}
										href={att.url}
										download
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent"
									>
										<span
											className="truncate max-w-[10rem]"
											title={att.filename}
										>
											{att.filename}
										</span>
										<Download className="h-3 w-3" />
									</a>
								))}
							</div>
						</div>
					)}

					{task.youtubeUrl && (
						<div className="mt-3 text-sm">
							<div className="mb-1 font-semibold flex items-center gap-2">
								<Youtube className="h-4 w-4 text-red-500" /> Video
							</div>
							<a
								href={task.youtubeUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 text-primary underline"
							>
								Watch on YouTube
							</a>
						</div>
					)}

					{task.outputVideoUrl && (
						<div className="mt-3 text-sm">
							<div className="mb-1 font-semibold">Output Video</div>
							<video controls className="mt-1 w-full max-h-64 rounded border">
								<source src={task.outputVideoUrl} type="video/mp4" />
								Your browser does not support the video tag.
							</video>
						</div>
					)}

					{task.mcpWorkflow && (
						<div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
							{aiState === "running" && (
								<span className="inline-flex items-center gap-1 text-primary">
									<span className="h-2 w-2 animate-pulse rounded-full bg-primary" />{" "}
									Running...
								</span>
							)}
							{aiState === "failed" && (
								<div className="inline-flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 px-2 py-1 text-destructive">
									<XCircle className="h-4 w-4" />
									<span>{task.aiErrorMessage || "Workflow failed"}</span>
									<Button
										size="sm"
										className="ml-2 h-7 px-2 inline-flex items-center gap-1"
										onClick={() => retryAi(task.id)}
									>
										<RefreshCw className="h-3 w-3 shrink-0" />
										<span>Retry</span>
									</Button>
								</div>
							)}
							{aiState === "blocked" && (
								<div className="inline-flex items-center gap-2 rounded border border-amber-400/40 bg-amber-50 px-2 py-1 text-amber-700">
									<AlertTriangle className="h-4 w-4" />
									<span>
										Missing:{" "}
										{(task.aiMissingParams || []).join(", ") ||
											"required parameters"}
									</span>
									<Button
										size="sm"
										variant="outline"
										className="ml-2 h-7 px-2"
										onClick={() => setAiOpen(true)}
									>
										Provide
									</Button>
									<Button
										size="sm"
										className="ml-1 h-7 px-2 inline-flex items-center gap-1"
										onClick={() => retryAi(task.id)}
									>
										<RefreshCw className="h-3 w-3 shrink-0" />
										<span>Retry</span>
									</Button>
								</div>
							)}
							{aiState === "requires_oauth" && (
								<div className="inline-flex items-center gap-2 rounded border border-amber-400/40 bg-amber-50 px-2 py-1 text-amber-700">
									<AlertTriangle className="h-4 w-4" />
									<span>Authorization required</span>
									<Button
										size="sm"
										variant="outline"
										className="ml-2 h-7 px-2"
										onClick={() => resolveOAuth(task.id)}
									>
										Connect
									</Button>
									<Button
										size="sm"
										className="ml-1 h-7 px-2 inline-flex items-center gap-1"
										onClick={() => retryAi(task.id)}
									>
										<RefreshCw className="h-3 w-3 shrink-0" />
										<span>Retry</span>
									</Button>
								</div>
							)}
							{(aiState === "pending" || aiState === undefined) && (
								<Button size="sm" onClick={() => runAi(task.id)}>
									Run
								</Button>
							)}
							{aiState === "running" && (
								<Button
									size="sm"
									variant="ghost"
									onClick={() => cancelAi(task.id)}
								>
									Cancel
								</Button>
							)}
						</div>
					)}
				</CardContent>
				{task.mcpWorkflow && (
					<AiTaskModal task={task} open={aiOpen} onOpenChange={setAiOpen} />
				)}
				<EditTaskDialog
					task={task}
					open={editOpen}
					onOpenChange={setEditOpen}
				/>
				{showConfetti && (
					<Confetti
						className="pointer-events-none absolute inset-0 z-[60] h-full w-full"
						options={{ particleCount: 60, ticks: 120 }}
						globalOptions={{ useWorker: true, resize: true }}
					/>
				)}
			</Card>
		</TooltipProvider>
	);
}
