"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import type {
	DealChecklistTask,
	DocumentCategory,
} from "@/types/_dashboard/dealRoom";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { useMemo } from "react";

const PRIORITY_COLORS = {
	low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
	medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
	high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
	critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
	"property-info": "Property Info",
	financials: "Financials",
	"due-diligence": "Due Diligence",
	legal: "Legal",
	financing: "Financing",
	closing: "Closing",
	"post-closing": "Post-Closing",
};

interface ChecklistProgressProps {
	tasks: DealChecklistTask[];
	onToggleTask?: (taskId: string) => void;
	onAddTask?: () => void;
}

export function ChecklistProgress({
	tasks,
	onToggleTask,
	onAddTask,
}: ChecklistProgressProps) {
	const stats = useMemo(() => {
		const completed = tasks.filter((t) => t.isCompleted).length;
		const total = tasks.length;
		const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
		const overdue = tasks.filter(
			(t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date(),
		).length;

		return { completed, total, percentage, overdue };
	}, [tasks]);

	const isOverdue = (task: DealChecklistTask) => {
		return (
			!task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date()
		);
	};

	const formatDueDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = date.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 0) return "Overdue";
		if (diffDays === 0) return "Due today";
		if (diffDays === 1) return "Due tomorrow";
		if (diffDays <= 7) return `Due in ${diffDays} days`;
		return date.toLocaleDateString();
	};

	// Group tasks by category
	const tasksByCategory = useMemo(() => {
		return tasks.reduce(
			(acc, task) => {
				if (!acc[task.category]) {
					acc[task.category] = [];
				}
				acc[task.category].push(task);
				return acc;
			},
			{} as Record<DocumentCategory, DealChecklistTask[]>,
		);
	}, [tasks]);

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-lg">
						<CheckCircle2 className="h-5 w-5" />
						Due Diligence Checklist
					</CardTitle>
					{onAddTask && (
						<Button size="sm" variant="outline" onClick={onAddTask}>
							Add Task
						</Button>
					)}
				</div>
				<div className="mt-3 space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">
							{stats.completed} of {stats.total} completed
						</span>
						<span className="font-medium">{stats.percentage}%</span>
					</div>
					<Progress value={stats.percentage} className="h-2" />
					{stats.overdue > 0 && (
						<div className="flex items-center gap-1.5 text-red-600 text-xs dark:text-red-400">
							<AlertCircle className="h-3.5 w-3.5" />
							{stats.overdue} overdue {stats.overdue === 1 ? "task" : "tasks"}
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4 p-4 pt-0">
				{Object.entries(tasksByCategory).map(([category, categoryTasks]) => (
					<div key={category} className="space-y-2">
						<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							{CATEGORY_LABELS[category as DocumentCategory]}
						</p>
						<div className="space-y-2">
							{categoryTasks.map((task) => (
								<div
									key={task.id}
									className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
										task.isCompleted
											? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
											: isOverdue(task)
												? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
												: "border-border bg-background"
									}`}
								>
									<Checkbox
										checked={task.isCompleted}
										onCheckedChange={() => onToggleTask?.(task.id)}
										className="mt-0.5"
									/>
									<div className="flex-1 min-w-0 space-y-1">
										<div className="flex items-start justify-between gap-2">
											<p
												className={`text-sm ${
													task.isCompleted
														? "text-muted-foreground line-through"
														: "font-medium"
												}`}
											>
												{task.title}
											</p>
											<Badge
												variant="outline"
												className={PRIORITY_COLORS[task.priority]}
											>
												{task.priority}
											</Badge>
										</div>
										{task.description && (
											<p className="text-muted-foreground text-xs">
												{task.description}
											</p>
										)}
										<div className="flex flex-wrap items-center gap-2 text-xs">
											{task.assignedTo && (
												<span className="text-muted-foreground">
													Assigned to {task.assignedTo}
												</span>
											)}
											{task.dueDate && (
												<span
													className={
														isOverdue(task)
															? "text-red-600 dark:text-red-400"
															: "text-muted-foreground"
													}
												>
													<Clock className="mr-1 inline h-3 w-3" />
													{formatDueDate(task.dueDate)}
												</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
