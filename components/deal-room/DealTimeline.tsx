"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DealMilestone } from "@/types/_dashboard/dealRoom";
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react";
import { useMemo } from "react";

interface DealTimelineProps {
	milestones: DealMilestone[];
	closingDate?: string;
}

export function DealTimeline({ milestones, closingDate }: DealTimelineProps) {
	const sortedMilestones = useMemo(() => {
		return [...milestones].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);
	}, [milestones]);

	const completedCount = useMemo(() => {
		return milestones.filter((m) => m.isCompleted).length;
	}, [milestones]);

	const daysUntilClosing = useMemo(() => {
		if (!closingDate) return null;
		const now = new Date();
		const closing = new Date(closingDate);
		const diffTime = closing.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}, [closingDate]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const isUpcoming = (dateString: string, isCompleted: boolean) => {
		if (isCompleted) return false;
		const date = new Date(dateString);
		const now = new Date();
		return date > now;
	};

	const isPast = (dateString: string, isCompleted: boolean) => {
		if (isCompleted) return false;
		const date = new Date(dateString);
		const now = new Date();
		return date < now;
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Calendar className="h-5 w-5" />
						Timeline & Milestones
					</CardTitle>
					{daysUntilClosing !== null && (
						<Badge
							variant="outline"
							className={
								daysUntilClosing < 7
									? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
									: "border-primary bg-primary/5 text-primary"
							}
						>
							<Clock className="mr-1.5 h-3 w-3" />
							{daysUntilClosing}d to close
						</Badge>
					)}
				</div>
				<p className="text-muted-foreground text-sm">
					{completedCount} of {milestones.length} milestones completed
				</p>
			</CardHeader>
			<CardContent className="p-4 pt-0">
				<div className="relative space-y-4">
					{/* Vertical Line */}
					<div className="absolute top-0 bottom-0 left-[11px] w-0.5 bg-border" />

					{sortedMilestones.map((milestone, index) => (
						<div key={milestone.id} className="relative flex gap-3">
							{/* Milestone Icon */}
							<div className="relative z-10 flex-shrink-0">
								{milestone.isCompleted ? (
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
										<CheckCircle2 className="h-4 w-4 text-white" />
									</div>
								) : milestone.isCriticalPath ? (
									<div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background">
										<Circle className="h-3 w-3 text-primary" />
									</div>
								) : (
									<div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-background">
										<Circle className="h-2.5 w-2.5 text-muted-foreground" />
									</div>
								)}
							</div>

							{/* Milestone Content */}
							<div className="flex-1 pb-4">
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0 flex-1">
										<p
											className={`font-medium text-sm ${
												milestone.isCompleted
													? "text-muted-foreground"
													: "text-foreground"
											}`}
										>
											{milestone.title}
											{milestone.isCriticalPath && (
												<Badge variant="outline" className="ml-2 text-xs">
													Critical
												</Badge>
											)}
										</p>
										<p className="text-muted-foreground text-xs">
											{milestone.description}
										</p>
									</div>
									<div className="flex-shrink-0 text-right">
										<p
											className={`text-xs ${
												milestone.isCompleted
													? "text-green-600 dark:text-green-400"
													: isPast(milestone.date, milestone.isCompleted)
														? "text-red-600 dark:text-red-400"
														: "text-muted-foreground"
											}`}
										>
											{formatDate(milestone.date)}
										</p>
										{milestone.isCompleted && milestone.completedAt && (
											<p className="text-muted-foreground text-xs">
												Completed {formatDate(milestone.completedAt)}
											</p>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
