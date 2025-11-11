"use client";

import { Badge } from "@/components/ui/badge";
import type {
	PlatformAdminPlan,
	PlatformAdminPlanItem,
} from "@/lib/admin/platformAdminPlan";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "external/shadcn-table/src/components/data-table/data-table";
import { DataTableColumnHeader } from "external/shadcn-table/src/components/data-table/data-table-column-header";
import { DataTableViewOptions } from "external/shadcn-table/src/components/data-table/data-table-view-options";
import { useDataTable } from "external/shadcn-table/src/hooks/use-data-table";
import * as React from "react";

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

export const planColumns: ColumnDef<PlatformAdminPlanItem>[] = [
	{
		accessorKey: "userStory",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="User Story" />
		),
		cell: ({ row }) => {
			const item = row.original;
			return (
				<div className="space-y-2">
					<div className="font-medium leading-snug">{item.userStory}</div>
					<ul className="list-disc space-y-1.5 pl-4 text-muted-foreground text-xs">
						{item.acceptanceCriteria.map((criterion) => (
							<li key={criterion}>{criterion}</li>
						))}
					</ul>
				</div>
			);
		},
		enableSorting: true,
	},
	{
		accessorKey: "epic",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Epic" />
		),
		enableSorting: true,
	},
	{
		accessorKey: "sprint",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Sprint" />
		),
		enableSorting: true,
	},
	{
		accessorKey: "priority",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Priority" />
		),
		cell: ({ row }) => {
			const priority =
				row.getValue<PlatformAdminPlanItem["priority"]>("priority");
			return <Badge variant={PRIORITY_VARIANT[priority]}>{priority}</Badge>;
		},
		enableSorting: true,
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => {
			const status = row.getValue<PlatformAdminPlanItem["status"]>("status");
			return <Badge variant="outline">{STATUS_TEXT[status]}</Badge>;
		},
		enableSorting: true,
	},
	{
		accessorKey: "storyPoints",
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title="Est. Story Points"
				className="justify-end"
			/>
		),
		cell: ({ row }) => (
			<span className="font-semibold">{row.getValue("storyPoints")}</span>
		),
		enableSorting: true,
		size: 120,
	},
];

export default function PlatformAdminPlanTable({
	plan,
}: PlatformAdminPlanTableProps) {
	const table = useDataTable<PlatformAdminPlanItem>({
		data: plan,
		columns: planColumns,
		pageCount: 0,
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: Math.max(plan.length, 10),
			},
		},
		disableGlobalColumns: true,
	});

	return (
		<div className="flex flex-col gap-3">
			<div className="flex justify-end">
				<DataTableViewOptions table={table.table} />
			</div>
			<DataTable table={table.table} />
		</div>
	);
}
