"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KanbanTask } from "../utils/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTaskStore } from "../utils/store";
import AiTaskModal from "../AiTaskModal";
import { Confetti } from "@/components/magicui/confetti";
import EditTaskDialog from "./EditTaskDialog";
import { DragHeader } from "./card/components/DragHeader";
import { AssignmentSelect } from "./card/components/AssignmentSelect";
import { LeadInfo } from "./card/components/LeadInfo";
import { Attachments } from "./card/components/Attachments";
import { Media } from "./card/components/Media";
import { AiHeaderControls } from "./card/components/AiHeaderControls";
import { AiStatusBar } from "./card/components/AiStatusBar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useKanbanView } from "../utils/viewStore";

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

// Very small and safe markdown parser: supports headings, bold, italics, code, links, and lists.
// We escape HTML first, then apply limited markdown replacements.
function renderBasicMarkdown(md?: string): { __html: string } {
	const text = (md ?? "").toString();
	const escape = (s: string) =>
		s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	let html = escape(text);
	// headings
	html = html.replace(
		/^######\s?(.*)$/gm,
		'<h6 class="text-xs font-semibold">$1</h6>',
	);
	html = html.replace(
		/^#####\s?(.*)$/gm,
		'<h5 class="text-sm font-semibold">$1</h5>',
	);
	html = html.replace(
		/^####\s?(.*)$/gm,
		'<h4 class="text-base font-semibold">$1</h4>',
	);
	html = html.replace(
		/^###\s?(.*)$/gm,
		'<h3 class="text-lg font-semibold">$1</h3>',
	);
	html = html.replace(
		/^##\s?(.*)$/gm,
		'<h2 class="text-xl font-semibold">$1</h2>',
	);
	html = html.replace(/^#\s?(.*)$/gm, '<h1 class="text-2xl font-bold">$1</h1>');
	// bold/italics/code inline
	html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
	html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
	html = html.replace(
		/`([^`]+)`/g,
		'<code class="px-1 py-0.5 rounded bg-muted text-xs">$1</code>',
	);
	// links
	html = html.replace(
		/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
		'<a href="$2" target="_blank" rel="noreferrer noopener" class="underline text-primary">$1</a>',
	);
	// unordered lists
	html = html.replace(/^(\s*)-\s+(.*)$/gm, "$1<li>$2</li>");
	html = html.replace(
		/(<li>.*<\/li>\n?)+/g,
		(m) => `<ul class="list-disc pl-5 space-y-1">${m}<\/ul>`,
	);
	// paragraphs
	html = html
		.split(/\n{2,}/)
		.map((blk) => {
			if (/^\s*<h\d|^\s*<ul|^\s*<li|^\s*<pre|^\s*<code/.test(blk)) return blk; // already a block
			return `<p class="leading-relaxed">${blk.replace(/\n/g, "<br/>")}<\/p>`;
		})
		.join("\n");
	return { __html: html };
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
	const previewFields = useKanbanView((s) => s.previewFields);
	const [assignedTeamMember, setAssignedTeamMember] = useState(
		task.assignedToTeamMember || "",
	);
	const [aiOpen, setAiOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [aiDetailsOpen, setAiDetailsOpen] = useState(false);
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

	const style = {
		transition,
		transform: CSS.Translate.toString(transform),
	} as const;

	const variants = cva("", {
		variants: {
			dragging: { over: "ring-2 opacity-30", overlay: "ring-2 ring-primary" },
		},
	});

	const handleAssign = (val: string) => {
		setAssignedTeamMember(val);
		task.assignedToTeamMember = val;
	};

	const aiState = task.aiState || "pending";
	// Ticking clock while running to update elapsed/ETA in tooltip
	const [tick, setTick] = useState(0);
	useEffect(() => {
		if (aiState !== "running") return;
		const id = setInterval(() => setTick((t) => t + 1), 1000);
		return () => clearInterval(id);
	}, [aiState]);
	// force re-render while running to update elapsed/ETA in header tooltip
	useMemo(() => tick, [tick]);
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
		<Card
			ref={setNodeRef}
			style={style}
			className={`${variants({ dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined })} relative`}
		>
			<DragHeader
				attributes={attributes as any}
				listeners={listeners}
				onEdit={() => setEditOpen(true)}
				onDelete={() => removeTask(String(task.id))}
				aiControls={
					task.mcpWorkflow ? (
						<AiHeaderControls
							task={task}
							aiState={aiState}
							aiBadge={aiBadge}
							onOpen={() => setAiOpen(true)}
							onCancel={() => cancelAi(task.id)}
							onRetry={() => retryAi(task.id)}
						/>
					) : null
				}
			/>

			<CardContent className="whitespace-pre-wrap px-3 pt-3 pb-6 text-left">
				<div className="font-semibold text-lg">{task.title}</div>
				{task.description && (
					<div className="mt-2 text-muted-foreground text-sm">
						{task.description}
					</div>
				)}

				{task.priority && previewFields.includes("priority") && (
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

				{task.scheduledDate && previewFields.includes("scheduledDate") && (
					<div className="mt-2 text-sm">
						<span className="font-semibold">Scheduled Date: </span>
						<span className="text-muted-foreground">{task.scheduledDate}</span>
					</div>
				)}
				{task.dueDate && previewFields.includes("dueDate") && (
					<div className="mt-2 text-sm">
						<span className="font-semibold">Due Date: </span>
						<span className="text-muted-foreground">{task.dueDate}</span>
					</div>
				)}

				{(previewFields.includes("leadId") ||
					previewFields.includes("leadListId")) && <LeadInfo task={task} />}

				{previewFields.includes("assignedToTeamMember") && (
					<AssignmentSelect
						value={assignedTeamMember}
						onChange={handleAssign}
					/>
				)}

				{previewFields.includes("attachments") && (
					<Attachments attachments={task.attachments} />
				)}
				{previewFields.includes("youtubeUrl") && (
					<Media youtubeUrl={task.youtubeUrl} />
				)}

				{task.status === "DONE" &&
					(task.outputVideoUrl ||
						task.outputImageUrl ||
						task.outputMarkdown ||
						(task.outputAttachments && task.outputAttachments.length)) && (
						<div className="mt-3">
							<Collapsible open={aiDetailsOpen} onOpenChange={setAiDetailsOpen}>
								<CollapsibleTrigger asChild>
									<button type="button" className="w-full text-left">
										<div className="flex items-center justify-between rounded-md border bg-amber-50 px-3 py-2 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
											<div className="text-sm font-semibold">From AI</div>
											<div className="text-xs opacity-70">
												{aiDetailsOpen ? "Hide" : "Show"}
											</div>
										</div>
									</button>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<div className="mt-3 grid gap-3">
										{task.outputVideoUrl && (
											<div className="text-sm">
												<div className="mb-1 font-semibold">Output Video</div>
												<video
													controls
													className="mt-1 w-full max-h-64 rounded border"
												>
													<source src={task.outputVideoUrl} type="video/mp4" />
													Your browser does not support the video tag.
												</video>
											</div>
										)}
										{task.outputImageUrl && (
											<div>
												<div className="text-sm font-semibold mb-1">
													AI Output Image
												</div>
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img
													src={task.outputImageUrl}
													alt="AI output"
													className="w-full rounded-md border object-cover"
												/>
											</div>
										)}
										{task.outputMarkdown && (
											<div>
												<div className="text-sm font-semibold mb-1">
													AI Output
												</div>
												<div
													className="prose prose-sm dark:prose-invert max-w-none"
													dangerouslySetInnerHTML={renderBasicMarkdown(
														task.outputMarkdown,
													)}
												/>
											</div>
										)}
										<Attachments
											title="AI Output Files"
											attachments={task.outputAttachments}
										/>
									</div>
								</CollapsibleContent>
							</Collapsible>
						</div>
					)}

				<AiStatusBar
					task={task}
					aiState={aiState}
					onRun={() => runAi(task.id)}
					onCancel={() => cancelAi(task.id)}
					onRetry={() => retryAi(task.id)}
					onResolveOAuth={() => resolveOAuth(task.id)}
					onProvide={() => setAiOpen(true)}
				/>
			</CardContent>
			{task.mcpWorkflow && (
				<AiTaskModal task={task} open={aiOpen} onOpenChange={setAiOpen} />
			)}
			<EditTaskDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
			{showConfetti && (
				<Confetti
					className="pointer-events-none absolute inset-0 z-[60] h-full w-full"
					options={{ particleCount: 60, ticks: 120 }}
					globalOptions={{ useWorker: true, resize: true }}
				/>
			)}
		</Card>
	);
}
