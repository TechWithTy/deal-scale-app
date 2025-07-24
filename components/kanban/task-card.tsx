import { Button } from "@/components/ui/button";
import { mockGeneratedLeads } from "@/constants/data";
import { mockLeadListData } from "@/constants/dashboard/leadList";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { mockTeamMembers } from "@/constants/_faker/profile/team/members";
import {} from "@/lib/stores/taskActions";
import type { KanbanTask } from "@/types/_dashboard/kanban";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { GripVertical } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";

// Priority-to-Badge variant mapping
const priorityBadgeVariant = {
	low: "outline", // Map 'low' to 'outline'
	medium: "default", // Map 'medium' to 'default'
	high: "destructive", // Map 'high' to 'destructive'
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
	// * Only show appointment if assigned to a single lead (not a lead list)
	const showAppointment =
		(!!task.appointmentDate || !!task.appointmentTime) &&
		!!task.leadId &&
		!task.leadListId;
	const [assignedTeamMember, setAssignedTeamMember] = useState(
		task.assignedToTeamMember || "",
	);

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: {
			type: "Task",
			task,
		} satisfies TaskDragData,
		attributes: {
			roleDescription: "Task",
		},
	});

	const style = {
		transition,
		transform: CSS.Translate.toString(transform),
	};

	const variants = cva("", {
		variants: {
			dragging: {
				over: "ring-2 opacity-30",
				overlay: "ring-2 ring-primary",
			},
		},
	});

	// Handle the team member selection
	const handleAssign = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedTeamMemberId = e.target.value;
		setAssignedTeamMember(selectedTeamMemberId); // Update state
		task.assignedToTeamMember = selectedTeamMemberId; // Update the task's assigned team member
	};

	// Find the assigned lead for this task
	const assignedLead =
		mockGeneratedLeads && Array.isArray(mockGeneratedLeads)
			? mockGeneratedLeads.find((lead) => lead.id === task.leadId)
			: undefined;

	return (
		<TooltipProvider>
			<Card
				ref={setNodeRef}
				style={style}
				className={variants({
					dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
				})}
			>
				<CardHeader className="space-between relative flex flex-row border-secondary border-b-2 px-3 py-3">
					{/* Drag handle button */}
					<Button
						variant={"ghost"}
						{...attributes}
						{...listeners}
						className="-ml-2 h-auto cursor-grab p-1 text-secondary-foreground/50"
					>
						<span className="sr-only">Move task</span>
						<GripVertical />
					</Button>
					{/* Badge for Task */}
					<Badge variant={"outline"} className="ml-auto font-semibold">
						Task
					</Badge>
					{/* * Show Play button if AI workflow is available */}
					{task.mcpWorkflow && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="secondary"
									className="mx-2 px-2 py-1 font-bold text-xs"
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
					)}
					{/* // * Only visible if mcpWorkflow exists */}
				</CardHeader>

				{/* Task Content */}
				<CardContent className="whitespace-pre-wrap px-3 pt-3 pb-6 text-left">
					{/* Task Title */}
					<div className="font-semibold text-lg">{task.title}</div>

					{/* Task Description */}
					{task.description && (
						<div className="mt-2 text-muted-foreground text-sm">
							{task.description}
						</div>
					)}

					{/* Priority */}
					{task.priority && (
						<div className="mt-2 text-sm">
							<span className="font-semibold">Priority: </span>
							<Badge
								variant={priorityBadgeVariant[task.priority] || "outline"} // Map priority to Badge variant
								className="ml-2"
							>
								{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
							</Badge>
						</div>
					)}

					{/* Due Date */}
					{task.dueDate && (
						<div className="mt-2 text-sm">
							<span className="font-semibold">Due Date: </span>
							<span className="text-muted-foreground">{task.dueDate}</span>
						</div>
					)}

					{/* Appointment Date/Time - Only show if valid for this task */}
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

					{/* Assigned To */}
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

					{/* Assigned Lead or Lead List */}
					{task.leadId ? (
						<div className="mt-2 text-sm">
							<span className="font-semibold">Lead: </span>
							{mockGeneratedLeads && Array.isArray(mockGeneratedLeads) ? (
								(() => {
									const lead = mockGeneratedLeads.find(
										(l) => l.id === task.leadId,
									);
									return lead ? (
										`${lead.firstName} ${lead.lastName}`
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
							{mockLeadListData && Array.isArray(mockLeadListData) ? (
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
				</CardContent>
			</Card>
		</TooltipProvider>
	);
}
