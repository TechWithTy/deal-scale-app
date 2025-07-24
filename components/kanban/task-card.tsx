import { Button } from "@/components/ui/button";
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

	return (
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

				{/* Assigned To */}
				<div className="mt-2 text-sm">
					<span className="font-semibold">Assigned To: </span>
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
			</CardContent>
		</Card>
	);
}
