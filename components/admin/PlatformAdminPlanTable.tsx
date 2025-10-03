import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type {
	PlatformAdminPlan,
	PlatformAdminPlanItem,
} from "@/lib/admin/platformAdminPlan";

interface PlatformAdminPlanTableProps {
	plan: PlatformAdminPlan;
}

const PRIORITY_VARIANT: Record<
	PlatformAdminPlanItem["priority"],
	"urgent" | "default" | "secondary"
> = {
	Critical: "urgent",
	High: "default",
	Medium: "secondary",
};

const STATUS_TEXT: Record<PlatformAdminPlanItem["status"], string> = {
	"To Do": "To Do",
	"In Progress": "In Progress",
	Done: "Done",
};

export default function PlatformAdminPlanTable({
	plan,
}: PlatformAdminPlanTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-2/5">User Story</TableHead>
					<TableHead>Epic</TableHead>
					<TableHead>Sprint</TableHead>
					<TableHead>Priority</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="text-right">Est. Story Points</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{plan.map((item) => (
					<TableRow key={item.userStory}>
						<TableCell className="align-top">
							<div className="font-medium">{item.userStory}</div>
							<ul className="mt-2 list-disc pl-4 text-muted-foreground text-xs">
								{item.acceptanceCriteria.map((criterion) => (
									<li key={criterion}>{criterion}</li>
								))}
							</ul>
						</TableCell>
						<TableCell className="align-top">{item.epic}</TableCell>
						<TableCell className="align-top">{item.sprint}</TableCell>
						<TableCell className="align-top">
							<Badge variant={PRIORITY_VARIANT[item.priority]}>
								{item.priority}
							</Badge>
						</TableCell>
						<TableCell className="align-top">
							<Badge variant="outline">{STATUS_TEXT[item.status]}</Badge>
						</TableCell>
						<TableCell className="align-top text-right font-semibold">
							{item.storyPoints}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
